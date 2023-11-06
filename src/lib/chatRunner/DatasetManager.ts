import { Challenge, DataSet } from "../types";
import mbpp from "@/data/programming-sets/mbpp.json";

export default class DatasetManager {
  constructor(private datasetName: DataSet) {}

  getChallenges(): Challenge[] {
    switch (this.datasetName) {
      case "MBPP":
        return this.getMBPPChallenges();
      default:
        throw new Error("Unknown dataset");
    }
  }

  getMBPPChallenges(): Challenge[] {
    return mbpp.map((challenge) => ({
      name: challenge.text,
      text: challenge.text,
      testCode: {
        setupCode: challenge.test_setup_code,
        testList: challenge.test_list,
      },
    }));
  }
}
