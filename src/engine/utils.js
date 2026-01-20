/**
 * utils.js - ユーティリティ関数
 * イージング、乱数、色変換、時間フォーマット、描画ヘルパー
 */

// ==================== イージング関数 ====================

export const Easing = {
  /**
   * リニア（等速）
   */
  linear: (t) => t,

  /**
   * イーズイン（緩やかに開始）
   */
  easeInQuad: (t) => t * t,

  easeInCubic: (t) => t * t * t,

  easeInQuart: (t) => t * t * t * t,

  /**
   * イーズアウト（緩やかに終了）
   */
  easeOutQuad: (t) => t * (2 - t),

  easeOutCubic: (t) => (--t) * t * t + 1,

  easeOutQuart: (t) => 1 - (--t) * t * t * t,

  /**
   * イーズインアウト（緩やかに開始・終了）
   */
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  /**
   * バウンス
   */
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  /**
   * エラスティック（弾性）
   */
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },

  /**
   * バック（少し戻る）
   */
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};

// ==================== 乱数生成 ====================

export const Random = {
  /**
   * min以上max未満の乱数を生成
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @returns {number}
   */
  range: (min, max) => Math.random() * (max - min) + min,

  /**
   * min以上max以下の整数乱数を生成
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @returns {number}
   */
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  /**
   * 配列からランダムに選択
   * @param {Array} array - 配列
   * @returns {*}
   */
  choice: (array) => array[Math.floor(Math.random() * array.length)],

  /**
   * 配列をシャッフル（Fisher-Yates）
   * @param {Array} array - 配列
   * @returns {Array} シャッフルされた新しい配列
   */
  shuffle: (array) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * 指定確率でtrueを返す
   * @param {number} probability - 確率（0〜1）
   * @returns {boolean}
   */
  chance: (probability) => Math.random() < probability,

  /**
   * ガウス分布（正規分布）の乱数を生成
   * @param {number} mean - 平均
   * @param {number} stdDev - 標準偏差
   * @returns {number}
   */
  gaussian: (mean = 0, stdDev = 1) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
};

// ==================== 色変換 ====================

export const Color = {
  /**
   * 16進数からRGBに変換
   * @param {string} hex - 16進数の色コード
   * @returns {{r: number, g: number, b: number}}
   */
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  },

  /**
   * RGBから16進数に変換
   * @param {number} r - 赤
   * @param {number} g - 緑
   * @param {number} b - 青
   * @returns {string}
   */
  rgbToHex: (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  /**
   * RGBからHSLに変換
   * @param {number} r - 赤（0-255）
   * @param {number} g - 緑（0-255）
   * @param {number} b - 青（0-255）
   * @returns {{h: number, s: number, l: number}}
   */
  rgbToHsl: (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  },

  /**
   * HSLからRGBに変換
   * @param {number} h - 色相（0-360）
   * @param {number} s - 彩度（0-100）
   * @param {number} l - 明度（0-100）
   * @returns {{r: number, g: number, b: number}}
   */
  hslToRgb: (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  },

  /**
   * 2色間を補間
   * @param {string} color1 - 開始色（16進数）
   * @param {string} color2 - 終了色（16進数）
   * @param {number} t - 補間値（0〜1）
   * @returns {string} 16進数の色
   */
  lerp: (color1, color2, t) => {
    const c1 = Color.hexToRgb(color1);
    const c2 = Color.hexToRgb(color2);

    return Color.rgbToHex(
      c1.r + (c2.r - c1.r) * t,
      c1.g + (c2.g - c1.g) * t,
      c1.b + (c2.b - c1.b) * t
    );
  },

  /**
   * 色を明るくする
   * @param {string} hex - 16進数の色
   * @param {number} amount - 明るくする量（0〜1）
   * @returns {string}
   */
  lighten: (hex, amount) => {
    return Color.lerp(hex, '#ffffff', amount);
  },

  /**
   * 色を暗くする
   * @param {string} hex - 16進数の色
   * @param {number} amount - 暗くする量（0〜1）
   * @returns {string}
   */
  darken: (hex, amount) => {
    return Color.lerp(hex, '#000000', amount);
  },

  /**
   * 透明度を追加
   * @param {string} hex - 16進数の色
   * @param {number} alpha - 透明度（0〜1）
   * @returns {string} rgba形式
   */
  withAlpha: (hex, alpha) => {
    const { r, g, b } = Color.hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
};

// ==================== 時間フォーマット ====================

export const TimeFormat = {
  /**
   * 秒をMM:SS形式に変換
   * @param {number} seconds - 秒
   * @returns {string}
   */
  toMMSS: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * 秒をHH:MM:SS形式に変換
   * @param {number} seconds - 秒
   * @returns {string}
   */
  toHHMMSS: (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * ミリ秒をSS.mmm形式に変換
   * @param {number} ms - ミリ秒
   * @returns {string}
   */
  toSSmmm: (ms) => {
    const secs = Math.floor(ms / 1000);
    const millis = Math.floor(ms % 1000);
    return `${secs}.${millis.toString().padStart(3, '0')}`;
  },

  /**
   * 日付を日本語形式に変換
   * @param {Date} date - 日付
   * @returns {string}
   */
  toJapaneseDate: (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  },

  /**
   * 相対時間を取得（〜前）
   * @param {Date|string} date - 日付
   * @returns {string}
   */
  toRelative: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}日前`;
    if (diffHour > 0) return `${diffHour}時間前`;
    if (diffMin > 0) return `${diffMin}分前`;
    return 'たった今';
  }
};

// ==================== 描画ヘルパー ====================

export const Draw = {
  /**
   * 角丸四角形を描画
   * @param {CanvasRenderingContext2D} ctx - コンテキスト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} width - 幅
   * @param {number} height - 高さ
   * @param {number} radius - 角の半径
   */
  roundRect: (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  /**
   * 円を描画
   * @param {CanvasRenderingContext2D} ctx - コンテキスト
   * @param {number} x - 中心X座標
   * @param {number} y - 中心Y座標
   * @param {number} radius - 半径
   */
  circle: (ctx, x, y, radius) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
  },

  /**
   * 線を描画
   * @param {CanvasRenderingContext2D} ctx - コンテキスト
   * @param {number} x1 - 開始X座標
   * @param {number} y1 - 開始Y座標
   * @param {number} x2 - 終了X座標
   * @param {number} y2 - 終了Y座標
   */
  line: (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  /**
   * テキストを中央揃えで描画
   * @param {CanvasRenderingContext2D} ctx - コンテキスト
   * @param {string} text - テキスト
   * @param {number} x - 中心X座標
   * @param {number} y - Y座標
   */
  textCenter: (ctx, text, x, y) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  },

  /**
   * 矢印を描画
   * @param {CanvasRenderingContext2D} ctx - コンテキスト
   * @param {number} fromX - 開始X座標
   * @param {number} fromY - 開始Y座標
   * @param {number} toX - 終了X座標
   * @param {number} toY - 終了Y座標
   * @param {number} headLength - 矢印の先端の長さ
   */
  arrow: (ctx, fromX, fromY, toX, toY, headLength = 10) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  },

  /**
   * 星形を描画
   * @param {CanvasRenderingContext2D} ctx - コンテキスト
   * @param {number} cx - 中心X座標
   * @param {number} cy - 中心Y座標
   * @param {number} spikes - 頂点の数
   * @param {number} outerRadius - 外側の半径
   * @param {number} innerRadius - 内側の半径
   */
  star: (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
};

// ==================== その他のユーティリティ ====================

/**
 * 値を範囲内に制限
 * @param {number} value - 値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 2点間の距離を計算
 * @param {number} x1 - 点1のX座標
 * @param {number} y1 - 点1のY座標
 * @param {number} x2 - 点2のX座標
 * @param {number} y2 - 点2のY座標
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 線形補間
 * @param {number} a - 開始値
 * @param {number} b - 終了値
 * @param {number} t - 補間値（0〜1）
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 角度をラジアンに変換
 * @param {number} degrees - 角度
 * @returns {number}
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * ラジアンを角度に変換
 * @param {number} radians - ラジアン
 * @returns {number}
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * 指定時間待機（Promise）
 * @param {number} ms - ミリ秒
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 点が矩形内にあるかチェック
 * @param {number} px - 点のX座標
 * @param {number} py - 点のY座標
 * @param {number} rx - 矩形のX座標
 * @param {number} ry - 矩形のY座標
 * @param {number} rw - 矩形の幅
 * @param {number} rh - 矩形の高さ
 * @returns {boolean}
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * 点が円内にあるかチェック
 * @param {number} px - 点のX座標
 * @param {number} py - 点のY座標
 * @param {number} cx - 円の中心X座標
 * @param {number} cy - 円の中心Y座標
 * @param {number} radius - 円の半径
 * @returns {boolean}
 */
export function pointInCircle(px, py, cx, cy, radius) {
  return distance(px, py, cx, cy) <= radius;
}

/**
 * デバウンス関数
 * @param {function} func - 関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * スロットル関数
 * @param {function} func - 関数
 * @param {number} limit - 制限時間（ミリ秒）
 * @returns {function}
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
