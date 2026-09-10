/**
 * Stub file to prevent crashes while migrating from Firebase to Supabase.
 * The services have not all been migrated yet.
 */
module.exports = {
  db: {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => {},
        update: async () => {},
        collection: () => ({
          doc: () => ({
            set: async () => {},
            get: async () => ({ exists: false })
          }),
          orderBy: () => ({
            limit: () => ({
              get: async () => ({ docs: [] })
            })
          })
        })
      }),
      where: () => ({
        limit: () => ({
          get: async () => ({ empty: true, docs: [] })
        })
      })
    }),
    runTransaction: async (cb) => cb({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: () => {},
      update: () => {}
    })
  },
  auth: {
    verifyIdToken: async () => ({ uid: 'mock-uid' }),
    getUserByPhoneNumber: async () => ({ uid: 'mock-uid' }),
    createUser: async () => ({ uid: 'mock-uid' })
  },
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => new Date()
      }
    }
  }
};
