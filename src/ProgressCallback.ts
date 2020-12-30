import {Song} from "./model/Song";
import {ProgressState} from "./ProgressState";

export interface ProgressCallback {
    (state: ProgressState, message: string, result: Song): void;
}
