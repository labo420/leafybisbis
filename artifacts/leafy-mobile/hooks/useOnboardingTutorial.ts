import { useState, useEffect } from "react";

export function useOnboardingTutorial(isLoggedIn: boolean) {
  const [shouldShow, setShouldShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShouldShow(false);
      setReady(true);
      return;
    }
    // Show tutorial every time user is logged in
    setShouldShow(true);
    setReady(true);
  }, [isLoggedIn]);

  const dismiss = () => setShouldShow(false);

  return { shouldShow: ready && shouldShow, dismiss };
}
