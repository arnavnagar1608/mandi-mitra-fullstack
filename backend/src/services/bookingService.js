const { db } = require('../config/firebase');
const admin = { firestore: { FieldValue: { serverTimestamp: () => new Date() } } };
const { generateQrPayload } = require('../utils/qr');

/**
 * Creates an appointment booking with atomic slot reservation & sequential daily token number.
 */
async function createBooking(farmerUid, input) {
  const { centerId, slotId, date, cropType, estimatedQuantity = 50 } = input;

  if (!centerId || !slotId || !date || !cropType) {
    const error = new Error('centerId, slotId, date, and cropType are required.');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const counterId = `${centerId}_${date}`;
  const counterRef = db.collection('daily_counters').doc(counterId);
  const slotRef = db.collection('slots').doc(slotId);
  const centerRef = db.collection('procurement_centers').doc(centerId);
  const farmerRef = db.collection('farmers').doc(farmerUid);
  const cropRef = db.collection('crops').doc(cropType);

  const bookingId = `b_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const bookingRef = db.collection('bookings').doc(bookingId);
  const procurementId = `p_${Date.now()}`;
  const procurementRef = db.collection('procurements').doc(procurementId);

  return await db.runTransaction(async (transaction) => {
    // 1. Verify Slot exists and has capacity
    const slotSnap = await transaction.get(slotRef);
    if (!slotSnap.exists) {
      const error = new Error(`Slot '${slotId}' does not exist.`);
      error.statusCode = 404;
      error.code = 'SLOT_NOT_FOUND';
      throw error;
    }

    const slotData = slotSnap.data();
    if (slotData.bookedCount >= slotData.maxFarmers) {
      const error = new Error(`Slot is fully booked (${slotData.bookedCount}/${slotData.maxFarmers} farmers).`);
      error.statusCode = 409;
      error.code = 'SLOT_FULL';
      throw error;
    }

    // 2. Prevent duplicate active bookings for the same farmer on the same date
    const existingBookingsQuery = await db.collection('bookings')
      .where('farmerId', '==', farmerUid)
      .where('date', '==', date)
      .where('status', '==', 'confirmed')
      .get();

    if (!existingBookingsQuery.empty) {
      const error = new Error(`You already have an active appointment booked for date ${date}.`);
      error.statusCode = 409;
      error.code = 'DUPLICATE_BOOKING';
      throw error;
    }

    // 3. Read crop MSP rate
    const cropSnap = await transaction.get(cropRef);
    const mspRate = cropSnap.exists ? (cropSnap.data().mspRate || 2275) : 2275;

    // 4. Read Center
    const centerSnap = await transaction.get(centerRef);
    const centerName = centerSnap.exists ? centerSnap.data().name : 'Procurement Center';

    // 5. Read atomic counter
    const counterSnap = await transaction.get(counterRef);
    let nextToken = 1;
    if (counterSnap.exists && counterSnap.data().lastTokenNumber) {
      nextToken = counterSnap.data().lastTokenNumber + 1;
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const qrPayload = generateQrPayload(bookingId, nextToken, centerId);
    const slotTime = `${slotData.startTime} - ${slotData.endTime}`;

    // 6. Atomically update counter
    transaction.set(counterRef, {
      id: counterId,
      centerId,
      date,
      lastTokenNumber: nextToken,
      updatedAt: now
    }, { merge: true });

    // 7. Increment slot capacity
    const newBookedCount = slotData.bookedCount + 1;
    transaction.update(slotRef, {
      bookedCount: newBookedCount,
      status: newBookedCount >= slotData.maxFarmers ? 'full' : 'available'
    });

    // 8. Create booking document
    const bookingDoc = {
      id: bookingId,
      farmerId: farmerUid,
      centerId,
      slotId,
      tokenNumber: nextToken,
      qrCode: qrPayload,
      cropType,
      estimatedQuantity: Number(estimatedQuantity),
      status: 'confirmed',
      date,
      slotTime,
      bookedAt: now,
      updatedAt: now
    };
    transaction.set(bookingRef, bookingDoc);

    // 9. Create corresponding procurement record (initiates 8-stage progress tracker)
    const procurementDoc = {
      id: procurementId,
      bookingId,
      farmerId: farmerUid,
      centerId,
      cropType,
      quantityQuintals: Number(estimatedQuantity),
      qualityGrade: 'PENDING',
      mspRate,
      totalAmount: Math.round(Number(estimatedQuantity) * mspRate),
      status: 'slot-confirmed',
      rejectionReason: null,
      createdAt: now,
      completedAt: null
    };
    transaction.set(procurementRef, procurementDoc);

    // 10. Write SMS / In-App Notification to farmer
    const notifId = `n_${Date.now()}`;
    const notifRef = farmerRef.collection('notifications').doc(notifId);
    transaction.set(notifRef, {
      id: notifId,
      farmerId: farmerUid,
      title: 'Booking Confirmed',
      titleHi: 'बुकिंग की पुष्टि',
      message: `Your appointment at ${centerName} on ${date} (${slotTime}) is confirmed. Token #${nextToken}.`,
      messageHi: `${date} को ${centerName} (${slotTime}) में आपका स्लॉट पुष्ट हुआ। टोकन #${nextToken}।`,
      type: 'success',
      read: false,
      createdAt: now
    });

    return {
      ...bookingDoc,
      procurementId
    };
  });
}

/**
 * Idempotent, transaction-safe booking cancellation (Safety Requirement #3).
 * Decrements slot bookedCount ONLY if the booking was actually active.
 */
async function cancelBooking(bookingId, farmerUid, isAdmin = false) {
  const bookingRef = db.collection('bookings').doc(bookingId);

  return await db.runTransaction(async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists) {
      const error = new Error(`Booking '${bookingId}' not found.`);
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    const booking = bookingSnap.data();

    // Verify ownership
    if (!isAdmin && booking.farmerId !== farmerUid) {
      const error = new Error('You are not authorized to cancel this booking.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Safety Requirement #3: Idempotency check!
    if (booking.status === 'cancelled') {
      return {
        alreadyCancelled: true,
        message: 'Booking was already cancelled.',
        booking
      };
    }

    if (booking.status !== 'confirmed') {
      const error = new Error(`Cannot cancel a booking that is currently '${booking.status}'.`);
      error.statusCode = 409;
      error.code = 'CANNOT_CANCEL';
      throw error;
    }

    const slotRef = db.collection('slots').doc(booking.slotId);
    const slotSnap = await transaction.get(slotRef);

    // Transactionally decrement slot bookedCount
    if (slotSnap.exists) {
      const slotData = slotSnap.data();
      const newCount = Math.max(0, (slotData.bookedCount || 1) - 1);
      transaction.update(slotRef, {
        bookedCount: newCount,
        status: newCount >= slotData.maxFarmers ? 'full' : 'available'
      });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // Mark booking cancelled
    transaction.update(bookingRef, {
      status: 'cancelled',
      cancelledAt: now,
      updatedAt: now
    });

    // Mark procurement cancelled if present
    const procSnap = await db.collection('procurements').where('bookingId', '==', bookingId).limit(1).get();
    if (!procSnap.empty) {
      transaction.update(procSnap.docs[0].ref, {
        status: 'cancelled',
        updatedAt: now
      });
    }

    // Write cancellation notification to farmer
    const notifRef = db.collection('farmers').doc(booking.farmerId).collection('notifications').doc(`n_cancel_${Date.now()}`);
    transaction.set(notifRef, {
      id: notifRef.id,
      farmerId: booking.farmerId,
      title: 'Booking Cancelled',
      titleHi: 'बुकिंग रद्द हुई',
      message: `Your appointment for Token #${booking.tokenNumber} on ${booking.date} has been cancelled.`,
      messageHi: `${booking.date} को टोकन #${booking.tokenNumber} की अपॉइंटमेंट रद्द कर दी गई है।`,
      type: 'warning',
      read: false,
      createdAt: now
    });

    return {
      success: true,
      bookingId,
      status: 'cancelled'
    };
  });
}

/**
 * Retrieves all bookings for the authenticated farmer.
 */
async function getFarmerBookings(farmerUid, { status } = {}) {
  let query = db.collection('bookings').where('farmerId', '==', farmerUid);

  if (status) {
    query = query.where('status', '==', status);
  }

  const snap = await query.get();
  const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Sort descending by bookedAt
  bookings.sort((a, b) => {
    const tA = a.bookedAt?.toMillis ? a.bookedAt.toMillis() : new Date(a.bookedAt || 0).getTime();
    const tB = b.bookedAt?.toMillis ? b.bookedAt.toMillis() : new Date(b.bookedAt || 0).getTime();
    return tB - tA;
  });

  return bookings;
}

/**
 * Retrieves booking details by ID.
 */
async function getBookingById(bookingId) {
  const doc = await db.collection('bookings').doc(bookingId).get();
  if (!doc.exists) {
    const error = new Error(`Booking '${bookingId}' not found.`);
    error.statusCode = 404;
    error.code = 'BOOKING_NOT_FOUND';
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

/**
 * Retrieves live queue status and 8-stage progress tracker for an active booking.
 */
async function getBookingQueueStatus(bookingId, farmerUid) {
  const booking = await getBookingById(bookingId);

  if (booking.farmerId !== farmerUid) {
    const error = new Error('Unauthorized access to booking queue status.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const centerDoc = await db.collection('procurement_centers').doc(booking.centerId).get();
  const centerData = centerDoc.exists ? centerDoc.data() : {};

  const currentServingToken = centerData.currentServingToken || 78;
  const myToken = booking.tokenNumber;
  const tokensAhead = Math.max(0, myToken - currentServingToken);
  const avgProcessingTime = centerData.avgProcessingTime || 18;
  const estimatedWaitMinutes = tokensAhead * avgProcessingTime;

  // Retrieve procurement stage
  const procSnap = await db.collection('procurements').where('bookingId', '==', bookingId).limit(1).get();
  const procurement = !procSnap.empty ? { id: procSnap.docs[0].id, ...procSnap.docs[0].data() } : null;

  return {
    bookingId: booking.id,
    centerId: booking.centerId,
    centerName: centerData.name,
    centerNameHi: centerData.nameHi,
    myToken,
    currentServingToken,
    tokensAhead,
    estimatedWaitMinutes,
    crowdLevel: centerData.crowdLevel || 'moderate',
    cropType: booking.cropType,
    estimatedQuantity: booking.estimatedQuantity,
    slotTime: booking.slotTime,
    date: booking.date,
    bookingStatus: booking.status,
    procurementStage: procurement ? procurement.status : 'slot-confirmed',
    qrCode: booking.qrCode
  };
}

module.exports = {
  createBooking,
  cancelBooking,
  getFarmerBookings,
  getBookingById,
  getBookingQueueStatus
};
