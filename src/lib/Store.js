import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";
import { goto } from "$app/navigation";
import { derived, get, writable } from "svelte/store";

export const isFinishing = writable(false);

export const session = writable({});
export const currentStep = writable(0);

/**
 * How the owner said they will use Pano. The backend always sends it with the step data
 * and falls back to `BOTH` itself, so this is only the guard for an errored/old payload.
 *
 * @type {"WEBSITE" | "SERVERS" | "BOTH"}
 */
export const DEFAULT_USAGE_MODE = "BOTH";

/**
 * The whole body of the last `GET /api/setup/step` (or of the `PUT` that answered with the
 * new step). Steps that need a field the wizard shares across steps - `usageMode` today -
 * read it from here instead of threading it through every `load()`.
 */
export const stepData = writable({});

/** @type {import("svelte/store").Readable<"WEBSITE" | "SERVERS" | "BOTH">} */
export const usageMode = derived(
  stepData,
  ($stepData) => $stepData.usageMode || DEFAULT_USAGE_MODE,
);

export const initialized = writable(false);

export function checkRoute(step, pathname) {
  const stepLocation = "/step-" + step;

  if (step === 0 && pathname !== "/") {
    return "/";
  } else if (step !== 0 && pathname !== stepLocation) {
    return stepLocation;
  } else {
    return null;
  }
}

export const navigationState = writable({
  nextDisabled: false,
  nextLoading: false,
  nextLabel: "buttons.next",
  nextAction: null,
  backDisabled: false,
  showSkip: false,
  skipAction: null,
});

export function checkCurrentStep() {
  return ApiUtil.get({ path: "/api/setup/step" })
    .then((body) => {
      if (body.error) {
        return { ...body, step: 0 };
      }

      return body;
    })
    .catch(() => {
      return { error: NETWORK_ERROR, step: 0 };
    })
    .then((stepInfo) => {
      stepData.set(stepInfo);

      return stepInfo;
    });
}

function initializeCurrentStep(path) {
  checkCurrentStep().then(async (stepInfo) => {
    const { step } = stepInfo;

    currentStep.set(step);

    const redirect = checkRoute(step, path);

    await goto(redirect);
  });
}

export function nextStep(body, path) {
  ApiUtil.put({
    path: "/api/setup/step",
    body: { ...body, clientStep: get(currentStep) },
  }).then((response) => {
    if (response && !response.error) {
      stepData.set(response);
    }

    initializeCurrentStep(path);
  });
}

export function goToStep(step, path) {
  ApiUtil.put({
    path: "/api/setup/step",
    body: { clientStep: get(currentStep), step: parseInt(step) },
  }).then(() => {
    initializeCurrentStep(path);
  });
}

export function backStep(path) {
  ApiUtil.put({
    path: "/api/setup/step",
    body: { clientStep: get(currentStep), step: get(currentStep) - 1 },
  }).then(() => {
    initializeCurrentStep(path);
  });
}
