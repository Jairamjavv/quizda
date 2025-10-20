import { connectMongo, ObjectId } from "../mongo.js";

interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
}

export type QuestionType =
  | "mcq_single"
  | "mcq_multiple"
  | "true_false"
  | "fill_blanks";
export type ContentType = "text" | "markdown" | "latex";

const Question = {
  async getByQuiz(quiz_id: string) {
    const db = await connectMongo();
    return await db
      .collection("questions")
      .find({ quiz_id: new ObjectId(quiz_id) })
      .sort({ order: 1 })
      .toArray();
  },

  async getById(id: string) {
    const db = await connectMongo();
    return await db.collection("questions").findOne({ _id: new ObjectId(id) });
  },

  async create({
    quiz_id,
    text,
    choices,
    points,
    tags,
    order,
    question_type = "mcq_single",
    content_type = "text",
    correct_answers = [],
  }: {
    quiz_id: string;
    text: string;
    choices: Choice[];
    points: number;
    tags: string[];
    order: number;
    question_type?: QuestionType;
    content_type?: ContentType;
    correct_answers?: string[];
  }) {
    const db = await connectMongo();
    const result = await db.collection("questions").insertOne({
      quiz_id: new ObjectId(quiz_id),
      text,
      choices,
      points,
      tags,
      order,
      question_type,
      content_type,
      correct_answers,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await db.collection("questions").findOne({ _id: result.insertedId });
  },

  async update(id: string, updateData: any) {
    const db = await connectMongo();
    const result = await db.collection("questions").updateOne(
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
    await db.collection("questions").deleteOne({ _id: new ObjectId(id) });
  },

  async deleteByQuiz(quiz_id: string) {
    const db = await connectMongo();
    await db
      .collection("questions")
      .deleteMany({ quiz_id: new ObjectId(quiz_id) });
  },
};

export default Question;
