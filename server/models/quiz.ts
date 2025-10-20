import { connectMongo, ObjectId } from "../mongo.js";

const Quiz = {
  async getAll() {
    const db = await connectMongo();
    return await db.collection("quizzes").find({}).toArray();
  },

  async getById(id: string) {
    const db = await connectMongo();
    return await db.collection("quizzes").findOne({ _id: new ObjectId(id) });
  },

  async create({
    title,
    description,
    group_id,
    total_points,
    tags,
    created_by,
    is_published = false,
  }: {
    title: string;
    description: string;
    group_id?: string;
    total_points: number;
    tags: string[];
    created_by: number;
    is_published?: boolean;
  }) {
    const db = await connectMongo();
    const result = await db.collection("quizzes").insertOne({
      title,
      description,
      group_id: group_id ? new ObjectId(group_id) : null,
      total_points,
      tags,
      created_by,
      is_published,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await db.collection("quizzes").findOne({ _id: result.insertedId });
  },

  async update(id: string, updateData: any) {
    const db = await connectMongo();

    // Convert group_id to ObjectId if it exists
    const processedData = { ...updateData };
    if (processedData.group_id) {
      processedData.group_id = new ObjectId(processedData.group_id);
    }

    const result = await db.collection("quizzes").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...processedData,
          updated_at: new Date(),
        },
      }
    );
    return result;
  },

  async delete(id: string) {
    const db = await connectMongo();
    await db.collection("quizzes").deleteOne({ _id: new ObjectId(id) });
  },

  async getPublished() {
    const db = await connectMongo();
    return await db
      .collection("quizzes")
      .find({ is_published: true })
      .toArray();
  },
};

export default Quiz;
