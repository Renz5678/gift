export type ThemeType = 'batman' | 'pucca' | 'default';

export interface ThemeConfig {
    type: ThemeType;
    cardBackground: string;
    titleColor: string;
    textColor: string;
    iconSource: any;
    accentColor: string;
}

const MATTHEW_USERNAME = 'Matthew';
const CLEOH_USERNAME = 'Cleoh';
const MATTHEW_EMAIL = 'lawrenzgarcia1202@gmail.com';
const CLEOH_EMAIL = 'jeztracleohabiera@gmail.com';

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
    batman: {
        type: 'batman',
        cardBackground: 'bg-gray-900',
        titleColor: 'text-yellow-400',
        textColor: 'text-gray-300',
        iconSource: require('../assets/icons/batman-logo.png'),
        accentColor: 'border-yellow-400',
    },
    pucca: {
        type: 'pucca',
        cardBackground: 'bg-pink-200',
        titleColor: 'text-red-400',
        textColor: 'text-gray-700',
        iconSource: require('../assets/icons/pucca-logo.png'),
        accentColor: 'border-pink-400',
    },
    default: {
        type: 'default',
        cardBackground: 'bg-gray-100',
        titleColor: 'text-gray-700',
        textColor: 'text-gray-600',
        iconSource: 'ionicon-heart', // Will be handled specially in the component
        accentColor: 'border-gray-400',
    },
};

/**
 * Determines the theme based on the username and email
 * @param username - The username of the post author
 * @param email - The email of the post author (optional for backward compatibility)
 * @returns The theme type ('batman', 'pucca', or 'default')
 */
export const getUserTheme = (username: string, email?: string): ThemeType => {
    // Validate Matthew's theme (both username AND email must match)
    if (username === MATTHEW_USERNAME && email === MATTHEW_EMAIL) {
        return 'batman';
    }
    // Validate Cleoh's theme (both username AND email must match)
    else if (username === CLEOH_USERNAME && email === CLEOH_EMAIL) {
        return 'pucca';
    }
    // Default theme for everyone else
    return 'default';
};

/**
 * Gets the theme configuration for a specific username and email
 * @param username - The username of the post author
 * @param email - The email of the post author (optional for backward compatibility)
 * @returns The complete theme configuration object
 */
export const getThemeConfig = (username: string, email?: string): ThemeConfig => {
    const themeType = getUserTheme(username, email);
    return THEME_CONFIGS[themeType];
};

/**
 * Gets the FAB (Floating Action Button) icon based on username and email
 * @param username - The current logged-in username
 * @param email - The current logged-in email (optional for backward compatibility)
 * @returns The icon source for the FAB
 */
export const getFABIcon = (username: string, email?: string): any => {
    const theme = getUserTheme(username, email);
    if (theme === 'batman') {
        return require('../assets/icons/batman-add.png');
    } else if (theme === 'pucca') {
        return require('../assets/icons/ribbon-add.png');
    }
    // Default icon for other users
    return 'ionicon-heart';
};

