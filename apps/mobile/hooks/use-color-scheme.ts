export type AppColorScheme = 'light';

/**
 * Temporary color-scheme override until dynamic theming is reintroduced.
 * Always return light mode so status/navigation bars stay readable.
 */
export function useColorScheme(): AppColorScheme {
  return 'light';
}

