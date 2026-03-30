import { useState, useEffect } from "react";

export function useOnboardingTutorial(justLoggedIn: boolean) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (justLoggedIn) {
      setShouldShow(true);
    }
  }, [justLoggedIn]);

  const dismiss = () => setShouldShow(false);

  return { shouldShow, dismiss };
}
