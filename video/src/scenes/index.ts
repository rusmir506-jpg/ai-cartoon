import React from "react";
import * as hook from "./hook";
import * as ch1 from "./ch1";
import * as ch2 from "./ch2";
import * as ch3 from "./ch3";
import * as ch4 from "./ch4";
import * as ch5 from "./ch5";
import * as ch6 from "./ch6";
export const SCENES: Record<string, React.FC> = { ...hook, ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, ...ch6 } as Record<string, React.FC>;
