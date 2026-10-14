import { employeeView } from '../models/employee.js';

export class MongoEmployeeRepository {
  constructor(model) {
    this.model = model;
  }

  async list() {
    const documents = await this.model.find().sort({ _id: 1 }).lean().exec();
    return documents.map(employeeView);
  }

  async find(id) {
    const document = await this.model.findById(id).lean().exec();
    return document ? employeeView(document) : null;
  }

  async create(input) {
    return employeeView(await this.model.create(input));
  }

  async update(id, input) {
    const document = await this.model
      .findByIdAndUpdate(
        id,
        { $set: input },
        {
          returnDocument: 'after',
          runValidators: true,
          writeConcern: { w: 1, j: true },
        },
      )
      .lean()
      .exec();
    return document ? employeeView(document) : null;
  }

  async delete(id) {
    const document = await this.model
      .findByIdAndDelete(id, { writeConcern: { w: 1, j: true } })
      .lean()
      .exec();
    return document ? employeeView(document) : null;
  }
}
