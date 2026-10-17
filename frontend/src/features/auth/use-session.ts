import { useEffect, useState } from "react";

import { ApiError, errorsFrom } from "@/lib/api/errors";

import { getMe } from "./api";
import type { User } from "./types";

export type Session =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; user: User }
  | { status: "error"; errors: string[] };

export function useSession(): Session {
  const [session, setSession] = useState<Session>({ status: "loading" });

  useEffect(() => {
    let active = true;

    getMe()
      .then((user) => {
        if (active) {
          setSession({ status: "user", user });
        }
      })
      .catch((reason: unknown) => {
        if (!active) {
          return;
        }
        setSession(
          reason instanceof ApiError && reason.status === 403 ?
            { status: "guest" }
          : { status: "error", errors: errorsFrom(reason).non_field_errors ?? [] },
        );
      });

    return () => {
      active = false;
    };
  }, []);

  return session;
}
