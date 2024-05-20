const fs = require("fs");
const crypto = require("crypto");

module.exports = class Repository {
  constructor(fileName) {
    if (!fileName) {
      throw new Error("Creating a repository requires a filename");
    }

    this.fileName = fileName;
    try {
      fs.accessSync(this.fileName);
    } catch (err) {
      fs.writeFileSync(this.fileName, "[]");
    }
  }

  async creat(attrs) {
    attrs.id = this.randomId();
    const records = await this.getAll();
    records.push(attrs);
    await this.writeAll(records);
    return attrs;
  }

  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.fileName, {
        encoding: "utf8",
      })
    );
  }

  async writeAll(attrs) {
    await fs.promises.writeFile(this.fileName, JSON.stringify(attrs, null, 2));
  }
  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }
  async findUserById(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }
  async deletUser(id) {
    const records = await this.getAll();
    const newRecord = records.filter((record) => record.id !== id);
    this.writeAll(newRecord);
  }
  async update(id, newUser) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);
    if (!record) {
      throw new Error(`record with id ${id} not found`);
    }

    Object.assign(record, newUser);
    await this.writeAll(records);
  }
  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }
};
