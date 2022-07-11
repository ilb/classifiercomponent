export default class CheckClassifications {
  /**
   * @param {VerificationRepository} verificationRepository
   */
  constructor({ verificationRepository }) {
    this.verificationRepository = verificationRepository;
  }

  /**
   * @param {string} uuid
   * @returns {Promise<*>}
   */
  async process({ uuid }) {
    const path = `${uuid}.classification`;
    const tasks = await this.verificationRepository.findAllByPath(path);
    return tasks.map((task) => ({
      status: {
        createdAt: task.status.createdAt,
        code: task.status.code,
      },
      time: task.endDate ? (task.endDate - task.begDate) / 1000 : 0
    }));
  }
}
