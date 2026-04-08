import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let landmarker: FaceLandmarker | null = null;
let loading = false;

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;
  if (loading) {
    // Wait for existing initialization
    while (loading) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return landmarker!;
  }

  loading = true;

  const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
  const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

  const vision = await FilesetResolver.forVisionTasks(CDN);

  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL,
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });

  loading = false;
  return landmarker;
}

export type Landmark = { x: number; y: number; z: number };
export type FaceLandmarks = Landmark[];
