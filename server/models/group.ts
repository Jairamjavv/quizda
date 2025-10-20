import { connectMongo, ObjectId } from "../mongo.js";

const Group = {
  async getAll() {
    const db = await connectMongo();
    return await db.collection("groups").find({}).toArray();
  },

  async getById(id: string) {
    const db = await connectMongo();
    return await db.collection("groups").findOne({ _id: new ObjectId(id) });
  },

  async create({
    name,
    description,
    created_by,
  }: {
    name: string;
    description: string;
    created_by: number;
  }) {
    const db = await connectMongo();
    const result = await db.collection("groups").insertOne({
      name,
      description,
      created_by,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await db.collection("groups").findOne({ _id: result.insertedId });
  },

  async update(id: string, updateData: any) {
    const db = await connectMongo();
    const result = await db.collection("groups").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updated_at: new Date(),
        },
      }
    );
    return result;
  },

  async delete(id: string) {
    const db = await connectMongo();
    await db.collection("groups").deleteOne({ _id: new ObjectId(id) });
  },
};

export default Group;
