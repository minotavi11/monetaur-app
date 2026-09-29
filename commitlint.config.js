module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "subject-first-letter-lowercase": ({ subject }) => {
          const first = subject?.[0];
          return [
            !first || /^[a-z]$/.test(first),
            "Commit message must start with a lowercase letter",
          ];
        },
      },
    },
  ],
  rules: {
    "subject-case": [0],
    "subject-first-letter-lowercase": [2, "always"],
  },
};
