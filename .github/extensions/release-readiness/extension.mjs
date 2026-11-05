import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";
import readiness from "../../../src/lib/releaseReadiness.js";

await joinSession({ workflows: [defineWorkflow(readiness.releaseReadiness)] });
