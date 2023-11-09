import { Challenge, DataSet } from "../types";
import mbpp from "@/data/programming-sets/mbpp.json";

export default class DatasetManager {
  constructor(private datasetName: DataSet) {}

  getChallenges(limit: number = -1): Challenge[] {
    let challenges = [];
    switch (this.datasetName) {
      case "MBPP":
        challenges = this.getMBPPChallenges();
        break;
      default:
        throw new Error("Unknown dataset");
    }

    if (limit === -1) return challenges;
    return challenges.slice(0, limit);
  }

  getMBPPChallenges(): Challenge[] {
    return mbpp.map((challenge) => ({
      name: challenge.text,
      text: challenge.text,
      testCode: {
        setupCode: challenge.test_setup_code,
        testList: challenge.test_list,
      },
      suggestedCode: challenge.code,
      codeHead: /def \w+\(.*\):/.exec(challenge.code)?.[0] || "",
    }));
  }
}
