import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";
import { goto } from "$app/navigation";
import { get, writable } from "svelte/store";

export const session = writable({});
export const currentStep = writable(0);

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

export async function checkCurrentStep() {
  return ApiUtil.get({ path: "/api/setup/step" })
    .then((body) => {
      if (body.error) {
        return { ...body, step: 0 };
      }

      return body;
    })
    .catch(() => {
      return { error: NETWORK_ERROR, step: 0 };
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
  }).then(() => {
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
