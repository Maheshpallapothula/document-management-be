export const REGEX = {
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_`^+#$!%()*?&./:;',])[A-Za-z\d@#^`_$+!%*()?&./:;',]{8,}$/,
  VALIDATE_EMAIL: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
  MIDDLE_SPACES: /^[^\s]+(\s[^\s]+)?$/,
};
