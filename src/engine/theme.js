/**
 * Theme - テーマ管理
 * 背景色、コントラスト、文字サイズをCSS変数で管理
 */

// テーマ定義
export const ThemeColors = {
  white: {
    name: '白',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    primary: '#4a90d9',
    primaryHover: '#3a7bc8',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  },
  black: {
    name: '黒',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    border: '#404040',
    primary: '#5a9fe9',
    primaryHover: '#4a8fd9',
    success: '#66bb6a',
    warning: '#ffb74d',
    error: '#ef5350'
  },
  sepia: {
    name: 'セピア',
    background: '#f4ecd8',
    surface: '#ebe3cf',
    text: '#5b4636',
    textSecondary: '#7a6a5a',
    border: '#d4c9b5',
    primary: '#8b7355',
    primaryHover: '#7a6245',
    success: '#6b8e23',
    warning: '#cd853f',
    error: '#cd5c5c'
  },
  gray: {
    name: 'グレー',
    background: '#e8e8e8',
    surface: '#d8d8d8',
    text: '#404040',
    textSecondary: '#606060',
    border: '#c0c0c0',
    primary: '#607d8b',
    primaryHover: '#546e7a',
    success: '#66bb6a',
    warning: '#ffa726',
    error: '#ef5350'
  }
};

// コントラスト調整値
export const ContrastLevels = {
  low: {
    name: '低',
    textOpacity: 0.7,
    borderOpacity: 0.5,
    shadowOpacity: 0.05
  },
  medium: {
    name: '中',
    textOpacity: 1.0,
    borderOpacity: 1.0,
    shadowOpacity: 0.1
  },
  high: {
    name: '高',
    textOpacity: 1.0,
    borderOpacity: 1.0,
    shadowOpacity: 0.2,
    textWeight: 'bold'
  }
};

// フォントサイズ
export const FontSizes = {
  medium: {
    name: '中',
    base: '16px',
    small: '14px',
    large: '20px',
    xlarge: '24px',
    xxlarge: '32px'
  },
  large: {
    name: '大',
    base: '20px',
    small: '18px',
    large: '26px',
    xlarge: '32px',
    xxlarge: '42px'
  }
};

export class Theme {
  constructor() {
    this.currentTheme = 'white';
    this.currentContrast = 'medium';
    this.currentFontSize = 'medium';

    // CSS変数を設定するルート要素
    this.root = document.documentElement;
  }

  /**
   * テーマを適用
   * @param {Object} options - オプション
   * @param {string} options.theme - テーマ名
   * @param {string} options.contrast - コントラストレベル
   * @param {string} options.fontSize - フォントサイズ
   */
  apply(options = {}) {
    if (options.theme && ThemeColors[options.theme]) {
      this.currentTheme = options.theme;
    }
    if (options.contrast && ContrastLevels[options.contrast]) {
      this.currentContrast = options.contrast;
    }
    if (options.fontSize && FontSizes[options.fontSize]) {
      this.currentFontSize = options.fontSize;
    }

    this._updateCSSVariables();
  }

  /**
   * CSS変数を更新
   */
  _updateCSSVariables() {
    const colors = ThemeColors[this.currentTheme];
    const contrast = ContrastLevels[this.currentContrast];
    const fontSize = FontSizes[this.currentFontSize];

    // 色のCSS変数
    this.root.style.setProperty('--color-background', colors.background);
    this.root.style.setProperty('--color-surface', colors.surface);
    this.root.style.setProperty('--color-text', colors.text);
    this.root.style.setProperty('--color-text-secondary', colors.textSecondary);
    this.root.style.setProperty('--color-border', colors.border);
    this.root.style.setProperty('--color-primary', colors.primary);
    this.root.style.setProperty('--color-primary-hover', colors.primaryHover);
    this.root.style.setProperty('--color-success', colors.success);
    this.root.style.setProperty('--color-warning', colors.warning);
    this.root.style.setProperty('--color-error', colors.error);

    // コントラストのCSS変数
    this.root.style.setProperty('--text-opacity', contrast.textOpacity);
    this.root.style.setProperty('--border-opacity', contrast.borderOpacity);
    this.root.style.setProperty('--shadow-opacity', contrast.shadowOpacity);
    this.root.style.setProperty('--text-weight', contrast.textWeight || 'normal');

    // フォントサイズのCSS変数
    this.root.style.setProperty('--font-size-base', fontSize.base);
    this.root.style.setProperty('--font-size-small', fontSize.small);
    this.root.style.setProperty('--font-size-large', fontSize.large);
    this.root.style.setProperty('--font-size-xlarge', fontSize.xlarge);
    this.root.style.setProperty('--font-size-xxlarge', fontSize.xxlarge);

    // bodyにテーマクラスを追加
    document.body.className = `theme-${this.currentTheme} contrast-${this.currentContrast} font-${this.currentFontSize}`;
  }

  /**
   * テーマを設定
   * @param {string} themeName - テーマ名
   */
  setTheme(themeName) {
    this.apply({ theme: themeName });
  }

  /**
   * コントラストを設定
   * @param {string} level - コントラストレベル
   */
  setContrast(level) {
    this.apply({ contrast: level });
  }

  /**
   * フォントサイズを設定
   * @param {string} size - フォントサイズ
   */
  setFontSize(size) {
    this.apply({ fontSize: size });
  }

  /**
   * 現在のテーマを取得
   * @returns {string}
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * 現在のコントラストを取得
   * @returns {string}
   */
  getContrast() {
    return this.currentContrast;
  }

  /**
   * 現在のフォントサイズを取得
   * @returns {string}
   */
  getFontSize() {
    return this.currentFontSize;
  }

  /**
   * 現在のテーマの色を取得
   * @param {string} [colorName] - 色名（省略時は全色）
   * @returns {string|Object}
   */
  getColors(colorName) {
    const colors = ThemeColors[this.currentTheme];
    if (colorName) {
      return colors[colorName];
    }
    return { ...colors };
  }

  /**
   * 利用可能なテーマ一覧を取得
   * @returns {Array}
   */
  getAvailableThemes() {
    return Object.entries(ThemeColors).map(([key, value]) => ({
      id: key,
      name: value.name
    }));
  }

  /**
   * 利用可能なコントラスト一覧を取得
   * @returns {Array}
   */
  getAvailableContrasts() {
    return Object.entries(ContrastLevels).map(([key, value]) => ({
      id: key,
      name: value.name
    }));
  }

  /**
   * 利用可能なフォントサイズ一覧を取得
   * @returns {Array}
   */
  getAvailableFontSizes() {
    return Object.entries(FontSizes).map(([key, value]) => ({
      id: key,
      name: value.name
    }));
  }

  /**
   * Canvas用の色を取得（16進数）
   * @param {string} colorName - 色名
   * @returns {string}
   */
  getCanvasColor(colorName) {
    return ThemeColors[this.currentTheme][colorName] || '#000000';
  }

  /**
   * 設定からテーマを適用
   * @param {Object} settings - 設定オブジェクト
   */
  applyFromSettings(settings) {
    this.apply({
      theme: settings.theme,
      contrast: settings.contrast,
      fontSize: settings.fontSize
    });
  }
}

// シングルトンインスタンス
export const theme = new Theme();

/**
 * テーマ適用のヘルパー関数
 * @param {Object} options - オプション
 */
export function applyTheme(options) {
  theme.apply(options);
}
