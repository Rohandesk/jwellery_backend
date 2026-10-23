require('dotenv').config();
const mongoose = require('mongoose');

const updateIndexes = async (collectionName, obsoleteIndex, indexes) => {
  const collection = mongoose.connection.collection(collectionName);
  let existingIndexes = [];
  try {
    existingIndexes = await collection.indexes();
  } catch (error) {
    if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }
  if (existingIndexes.some((index) => index.name === obsoleteIndex)) {
    await collection.dropIndex(obsoleteIndex);
    console.log(`[Store migration] Dropped ${collectionName}.${obsoleteIndex}`);
  }
  for (const index of indexes) {
    const exists = existingIndexes.some((existing) => existing.name === index.name);
    if (!exists) {
      const options = {
        name: index.name,
        ...(index.unique !== undefined && { unique: index.unique }),
        ...(index.sparse !== undefined && { sparse: index.sparse }),
      };
      await collection.createIndex(index.key, options);
      console.log(`[Store migration] Created ${collectionName}.${index.name}`);
    }
  }
};

const migrateStoreIndexes = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await updateIndexes('wallets', 'userId_1', [
    {
      name: 'userId_1_jewellerId_1',
      key: { userId: 1, jewellerId: 1 },
      unique: true,
    },
  ]);
  await updateIndexes('settings', 'key_1', [
    {
      name: 'key_1_jewellerId_1',
      key: { key: 1, jewellerId: 1 },
      unique: true,
    },
  ]);
  await updateIndexes('admins', null, [
    {
      name: 'jewellerId_1',
      key: { jewellerId: 1 },
      unique: true,
      sparse: true,
    },
  ]);
  await updateIndexes('userstores', null, [
    {
      name: 'userId_1_jewellerId_1',
      key: { userId: 1, jewellerId: 1 },
      unique: true,
    },
  ]);
};

migrateStoreIndexes()
  .then(async () => {
    console.log('[Store migration] Index updates complete. Existing records were not modified.');
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error('[Store migration] Failed:', error);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
