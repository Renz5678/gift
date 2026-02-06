export type ThemeType = 'batman' | 'pucca';

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
};

/**
 * Determines the theme based on the username
 * @param username - The username of the post author
 * @returns The theme type ('batman' or 'pucca')
 */
export const getUserTheme = (username: string): ThemeType => {
    if (username === MATTHEW_USERNAME) {
        return 'batman';
    } else if (username === CLEOH_USERNAME) {
        return 'pucca';
    }
    // Default to batman theme
    return 'batman';
};

/**
 * Gets the theme configuration for a specific username
 * @param username - The username of the post author
 * @returns The complete theme configuration object
 */
export const getThemeConfig = (username: string): ThemeConfig => {
    const themeType = getUserTheme(username);
    return THEME_CONFIGS[themeType];
};

/**
 * Gets the FAB (Floating Action Button) icon based on username
 * @param username - The current logged-in username
 * @returns The icon source for the FAB
 */
export const getFABIcon = (username: string): any => {
    const theme = getUserTheme(username);
    if (theme === 'batman') {
        return require('../assets/icons/batman-add.png');
    }
    return require('../assets/icons/ribbon-add.png');
};
