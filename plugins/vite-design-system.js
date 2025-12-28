/**
 * Vite Design System Plugin
 *
 * Reads design-system.json and generates:
 * - CSS custom properties (variables)
 * - Tailwind CSS 4 @theme configuration
 * - Responsive typography with clamp()
 * - Utility classes
 */

import fs from 'fs';
import path from 'path';
import { green, red, yellow } from '../siteforge/tools/utils';

/**
 * Parse rem/px value to number (in rem)
 */
function parseSize(value) {
  if (typeof value === 'number') return value;
  const match = value.match(/^([\d.]+)(rem|px)$/);
  if (!match) return parseFloat(value);
  const [, num, unit] = match;
  return unit === 'px' ? parseFloat(num) / 16 : parseFloat(num);
}

/**
 * Parse breakpoint to pixels
 */
function parseBreakpoint(value) {
  const match = value.match(/^([\d.]+)(px|rem)$/);
  if (!match) return parseFloat(value);
  const [, num, unit] = match;
  return unit === 'rem' ? parseFloat(num) * 16 : parseFloat(num);
}

/**
 * Generate clamp() for fluid typography
 * Creates a value that scales smoothly between two breakpoints
 *
 * @param {number} minSize - Minimum size in rem
 * @param {number} maxSize - Maximum size in rem
 * @param {number} minVw - Minimum viewport width in px
 * @param {number} maxVw - Maximum viewport width in px
 * @returns {string} CSS clamp() function
 */
function generateClamp(minSize, maxSize, minVw, maxVw) {
  // Convert to rem for consistency
  const minRem = minSize;
  const maxRem = maxSize;

  // Calculate the slope and intercept
  // y = mx + b where x is viewport width
  // m = (maxSize - minSize) / (maxVw - minVw)
  const slope = (maxRem - minRem) / ((maxVw - minVw) / 16); // Convert vw diff to rem
  const intercept = minRem - (slope * (minVw / 16));

  // Format: clamp(min, preferred, max)
  // preferred = intercept + slope * 100vw
  const slopeVw = (slope * 100).toFixed(4);
  const interceptRem = intercept.toFixed(4);

  // Simplify the preferred value
  const preferred = `${interceptRem}rem + ${slopeVw}vw`;

  return `clamp(${minRem}rem, ${preferred}, ${maxRem}rem)`;
}

/**
 * Generate CSS custom properties from design system
 */
function generateCSSVariables(designSystem) {
  const lines = [];
  const breakpoints = designSystem.breakpoints || { sm: '375px', lg: '1024px', xl: '1536px' };
  const smVw = parseBreakpoint(breakpoints.sm);
  const lgVw = parseBreakpoint(breakpoints.lg);
  const xlVw = parseBreakpoint(breakpoints.xl);

  lines.push(':root {');

  // ============================================
  // COLORS
  // ============================================
  if (designSystem.colors) {
    lines.push('  /* Colors */');

    for (const [colorName, colorConfig] of Object.entries(designSystem.colors)) {
      if (colorConfig.shades) {
        // Color with shades - base is used as the main color and 500
        lines.push(`  --color-${colorName}: ${colorConfig.base};`);
        lines.push(`  --color-${colorName}-500: ${colorConfig.base};`);
        for (const [shade, value] of Object.entries(colorConfig.shades)) {
          lines.push(`  --color-${colorName}-${shade}: ${value};`);
        }
      } else if (colorConfig.base) {
        // Simple color with just base
        lines.push(`  --color-${colorName}: ${colorConfig.base};`);
      }
    }
    lines.push('');
  }

  // ============================================
  // FONTS
  // ============================================
  if (designSystem.fonts) {
    lines.push('  /* Fonts */');

    for (const [fontName, fontConfig] of Object.entries(designSystem.fonts)) {
      const family = Array.isArray(fontConfig.family)
        ? fontConfig.family.join(', ')
        : fontConfig.family;
      lines.push(`  --font-${fontName}: ${family};`);
    }
    lines.push('');
  }

  // ============================================
  // TYPOGRAPHY - Static sizes
  // ============================================
  if (designSystem.typography) {
    lines.push('  /* Typography - Static Sizes */');

    for (const [typeName, typoConfig] of Object.entries(designSystem.typography)) {
      // Static sizes for each breakpoint
      lines.push(`  --text-${typeName}-sm: ${typoConfig.sm};`);
      lines.push(`  --text-${typeName}-lg: ${typoConfig.lg};`);
      lines.push(`  --text-${typeName}-xl: ${typoConfig.xl};`);

      // Additional typography properties
      if (typoConfig.lineHeight) {
        lines.push(`  --text-${typeName}-line-height: ${typoConfig.lineHeight};`);
      }
      if (typoConfig.letterSpacing) {
        lines.push(`  --text-${typeName}-letter-spacing: ${typoConfig.letterSpacing};`);
      }
      if (typoConfig.weight) {
        lines.push(`  --text-${typeName}-weight: ${typoConfig.weight};`);
      }
      if (typoConfig.font && designSystem.fonts[typoConfig.font]) {
        const family = Array.isArray(designSystem.fonts[typoConfig.font].family)
          ? designSystem.fonts[typoConfig.font].family.join(', ')
          : designSystem.fonts[typoConfig.font].family;
        lines.push(`  --text-${typeName}-font: ${family};`);
      }
    }
    lines.push('');

    // Typography - Fluid clamps
    lines.push('  /* Typography - Fluid (clamp sm→lg) */');
    for (const [typeName, typoConfig] of Object.entries(designSystem.typography)) {
      const smSize = parseSize(typoConfig.sm);
      const lgSize = parseSize(typoConfig.lg);
      const clamp = generateClamp(smSize, lgSize, smVw, lgVw);
      lines.push(`  --text-${typeName}: ${clamp};`);
    }
    lines.push('');

    // Typography - Large fluid clamps (lg→xl)
    lines.push('  /* Typography - Fluid Large (clamp lg→xl) */');
    for (const [typeName, typoConfig] of Object.entries(designSystem.typography)) {
      const lgSize = parseSize(typoConfig.lg);
      const xlSize = parseSize(typoConfig.xl);
      const clamp = generateClamp(lgSize, xlSize, lgVw, xlVw);
      lines.push(`  --text-${typeName}-fluid-xl: ${clamp};`);
    }
    lines.push('');
  }

  // ============================================
  // SPACING
  // ============================================
  if (designSystem.spacing) {
    lines.push('  /* Spacing */');
    for (const [spaceName, value] of Object.entries(designSystem.spacing)) {
      lines.push(`  --spacing-${spaceName}: ${value};`);
    }
    lines.push('');
  }

  // ============================================
  // RADIUS
  // ============================================
  if (designSystem.radius) {
    lines.push('  /* Border Radius */');
    for (const [radiusName, value] of Object.entries(designSystem.radius)) {
      lines.push(`  --radius-${radiusName}: ${value};`);
    }
    lines.push('');
  }

  // ============================================
  // SHADOWS
  // ============================================
  if (designSystem.shadows) {
    lines.push('  /* Shadows */');
    for (const [shadowName, value] of Object.entries(designSystem.shadows)) {
      lines.push(`  --shadow-${shadowName}: ${value};`);
    }
    lines.push('');
  }

  // ============================================
  // TRANSITIONS
  // ============================================
  if (designSystem.transitions) {
    lines.push('  /* Transitions */');
    for (const [transName, value] of Object.entries(designSystem.transitions)) {
      lines.push(`  --transition-${transName}: ${value};`);
    }
    lines.push('');
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate Tailwind CSS 4 @theme configuration
 */
function generateTailwindTheme(designSystem) {
  const lines = [];

  lines.push('@theme {');

  // Colors
  if (designSystem.colors) {
    for (const [colorName, colorConfig] of Object.entries(designSystem.colors)) {
      if (colorConfig.shades) {
        // Base is the main color and 500
        lines.push(`  --color-${colorName}: ${colorConfig.base};`);
        lines.push(`  --color-${colorName}-500: ${colorConfig.base};`);
        for (const [shade, value] of Object.entries(colorConfig.shades)) {
          lines.push(`  --color-${colorName}-${shade}: ${value};`);
        }
      } else if (colorConfig.base) {
        lines.push(`  --color-${colorName}: ${colorConfig.base};`);
      }
    }
  }

  // Fonts
  if (designSystem.fonts) {
    for (const [fontName, fontConfig] of Object.entries(designSystem.fonts)) {
      const family = Array.isArray(fontConfig.family)
        ? fontConfig.family.join(', ')
        : fontConfig.family;
      lines.push(`  --font-${fontName}: ${family};`);
    }
  }

  // Spacing (extend Tailwind's spacing)
  if (designSystem.spacing) {
    for (const [spaceName, value] of Object.entries(designSystem.spacing)) {
      lines.push(`  --spacing-${spaceName}: ${value};`);
    }
  }

  // Radius
  if (designSystem.radius) {
    for (const [radiusName, value] of Object.entries(designSystem.radius)) {
      lines.push(`  --radius-${radiusName}: ${value};`);
    }
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate utility classes for typography
 */
function generateTypographyUtilities(designSystem) {
  if (!designSystem.typography) return '';

  const lines = [];

  lines.push('/* Typography Utility Classes */');
  lines.push('@layer utilities {');

  for (const [typeName, typoConfig] of Object.entries(designSystem.typography)) {
    lines.push(`  .text-${typeName} {`);
    lines.push(`    font-size: var(--text-${typeName});`);

    if (typoConfig.lineHeight) {
      lines.push(`    line-height: var(--text-${typeName}-line-height);`);
    }
    if (typoConfig.letterSpacing) {
      lines.push(`    letter-spacing: var(--text-${typeName}-letter-spacing);`);
    }
    if (typoConfig.weight) {
      lines.push(`    font-weight: var(--text-${typeName}-weight);`);
    }
    if (typoConfig.font) {
      lines.push(`    font-family: var(--text-${typeName}-font);`);
    }

    lines.push('  }');
    lines.push('');
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate Google Fonts import URL
 */
function generateGoogleFontsUrl(designSystem) {
  if (!designSystem.fonts) return null;

  const fontStrings = [];

  for (const fontConfig of Object.values(designSystem.fonts)) {
    if (fontConfig.google) {
      fontStrings.push(fontConfig.google);
    }
  }

  if (fontStrings.length === 0) return null;

  return `https://fonts.googleapis.com/css2?${fontStrings.map(f => `family=${f}`).join('&')}&display=swap`;
}

/**
 * Generate WordPress theme.json from design system
 * This syncs colors, fonts, spacing with the FSE editor
 */
function generateThemeJson(designSystem, existingThemeJson = null) {
  // Start with existing theme.json or a base structure
  const themeJson = existingThemeJson || {
    $schema: 'https://schemas.wp.org/trunk/theme.json',
    version: 2,
    settings: {},
    styles: {},
  };

  // Ensure settings exist
  themeJson.settings = themeJson.settings || {};
  themeJson.settings.color = themeJson.settings.color || {};
  themeJson.settings.typography = themeJson.settings.typography || {};
  themeJson.settings.spacing = themeJson.settings.spacing || {};

  // ============================================
  // COLORS
  // ============================================
  if (designSystem.colors) {
    const palette = [];

    for (const [colorName, colorConfig] of Object.entries(designSystem.colors)) {
      if (colorConfig.shades) {
        // Add base as main color (500)
        const colorNameCapitalized = colorName.charAt(0).toUpperCase() + colorName.slice(1);
        palette.push({
          slug: colorName,
          color: `var(--color-${colorName})`,
          name: colorNameCapitalized,
        });
        palette.push({
          slug: `${colorName}-500`,
          color: `var(--color-${colorName}-500)`,
          name: `${colorNameCapitalized} 500`,
        });
        // Add all other shades
        for (const [shade, value] of Object.entries(colorConfig.shades)) {
          palette.push({
            slug: `${colorName}-${shade}`,
            color: `var(--color-${colorName}-${shade})`,
            name: `${colorNameCapitalized} ${shade}`,
          });
        }
      } else if (colorConfig.base) {
        palette.push({
          slug: colorName,
          color: `var(--color-${colorName})`,
          name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
        });
      }
    }

    themeJson.settings.color.palette = palette;
    themeJson.settings.color.defaultPalette = false;
    themeJson.settings.color.defaultGradients = false;
    themeJson.settings.color.custom = true;
  }

  // ============================================
  // FONTS
  // ============================================
  if (designSystem.fonts) {
    const fontFamilies = [];

    for (const [fontName, fontConfig] of Object.entries(designSystem.fonts)) {
      const family = Array.isArray(fontConfig.family)
        ? fontConfig.family.join(', ')
        : fontConfig.family;

      fontFamilies.push({
        fontFamily: `var(--font-${fontName})`,
        slug: fontName,
        name: fontName.charAt(0).toUpperCase() + fontName.slice(1),
      });
    }

    themeJson.settings.typography.fontFamilies = fontFamilies;
  }

  // ============================================
  // TYPOGRAPHY SIZES (fluid)
  // ============================================
  if (designSystem.typography) {
    const fontSizes = [];

    for (const [typeName, typoConfig] of Object.entries(designSystem.typography)) {
      fontSizes.push({
        slug: typeName,
        size: `var(--text-${typeName})`,
        name: typeName.charAt(0).toUpperCase() + typeName.slice(1).replace(/-/g, ' '),
        fluid: false, // Already fluid via CSS clamp
      });
    }

    themeJson.settings.typography.fontSizes = fontSizes;
    themeJson.settings.typography.customFontSize = true;
  }

  // ============================================
  // SPACING
  // ============================================
  if (designSystem.spacing) {
    const spacingSizes = [];

    for (const [spaceName, value] of Object.entries(designSystem.spacing)) {
      spacingSizes.push({
        slug: spaceName,
        size: `var(--spacing-${spaceName})`,
        name: spaceName.toUpperCase(),
      });
    }

    themeJson.settings.spacing.spacingSizes = spacingSizes;
    themeJson.settings.spacing.customSpacingSize = true;
    themeJson.settings.spacing.units = ['px', 'em', 'rem', 'vh', 'vw', '%'];
  }

  // ============================================
  // STYLES
  // ============================================
  themeJson.styles = themeJson.styles || {};
  themeJson.styles.color = {
    background: 'var(--color-neutral-50)',
    text: 'var(--color-neutral-900)',
  };
  themeJson.styles.typography = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-body)',
    lineHeight: 'var(--text-body-line-height)',
  };

  // Elements (headings, links)
  themeJson.styles.elements = themeJson.styles.elements || {};
  themeJson.styles.elements.link = {
    color: { text: 'var(--color-primary)' },
    ':hover': { color: { text: 'var(--color-primary-600)' } },
  };

  // Headings
  const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  for (const h of headings) {
    if (designSystem.typography && designSystem.typography[h]) {
      themeJson.styles.elements[h] = {
        typography: {
          fontFamily: `var(--text-${h}-font)`,
          fontSize: `var(--text-${h})`,
          fontWeight: `var(--text-${h}-weight)`,
          lineHeight: `var(--text-${h}-line-height)`,
        },
      };
    }
  }

  return themeJson;
}

/**
 * Main Vite plugin
 */
export function designSystemPlugin(options = {}) {
  const {
    configPath = 'design-system.json',
    outputPath = 'assets/src/_design-system.css',
    generateTheme = true,
    generateUtilities = true,
    syncThemeJson = true,
    themeJsonPath = 'theme.json',
  } = options;

  let designSystem = null;
  let resolvedConfigPath = null;

  return {
    name: 'vite-design-system',

    configResolved(config) {
      resolvedConfigPath = path.resolve(config.root, configPath);
    },

    buildStart() {
      // Read and parse design system
      if (!fs.existsSync(resolvedConfigPath)) {
        console.warn(red,`[Design System] Config file not found: ${resolvedConfigPath}`);
        return;
      }

      try {
        const content = fs.readFileSync(resolvedConfigPath, 'utf-8');
        designSystem = JSON.parse(content);
        console.log(green,'[Design System] Loaded configuration');
      } catch (error) {
        console.error(red, `[Design System] Error parsing config: ${error.message}`);
        return;
      }

      // Generate CSS
      const cssLines = [];

      // Add Google Fonts import if available
      const googleFontsUrl = generateGoogleFontsUrl(designSystem);
      if (googleFontsUrl) {
        cssLines.push(`@import url('${googleFontsUrl}');`);
        cssLines.push('');
      }

      // Add CSS variables
      cssLines.push(generateCSSVariables(designSystem));
      cssLines.push('');

      // Add Tailwind @theme
      if (generateTheme) {
        cssLines.push(generateTailwindTheme(designSystem));
        cssLines.push('');
      }

      // Add typography utilities
      if (generateUtilities) {
        cssLines.push(generateTypographyUtilities(designSystem));
      }

      // Write the generated CSS
      const outputFile = path.resolve(path.dirname(resolvedConfigPath), outputPath);
      const outputDir = path.dirname(outputFile);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, cssLines.join('\n'));
      console.log(green, `[Design System] Generated CSS: ${outputFile}`);

      // Generate/update theme.json if enabled
      if (syncThemeJson) {
        const themeJsonFile = path.resolve(path.dirname(resolvedConfigPath), themeJsonPath);

        // Read existing theme.json if it exists
        let existingThemeJson = null;
        if (fs.existsSync(themeJsonFile)) {
          try {
            const content = fs.readFileSync(themeJsonFile, 'utf-8');
            existingThemeJson = JSON.parse(content);
          } catch (e) {
            console.warn(red,'[Design System] Could not parse existing theme.json');
          }
        }

        // Generate new theme.json
        const newThemeJson = generateThemeJson(designSystem, existingThemeJson);

        // Preserve some settings from existing theme.json
        if (existingThemeJson) {
          // Keep layout settings
          if (existingThemeJson.settings?.layout) {
            newThemeJson.settings.layout = existingThemeJson.settings.layout;
          }
          // Keep appearance tools setting
          if (existingThemeJson.settings?.appearanceTools !== undefined) {
            newThemeJson.settings.appearanceTools = existingThemeJson.settings.appearanceTools;
          }
          // Keep root padding aware alignments
          if (existingThemeJson.settings?.useRootPaddingAwareAlignments !== undefined) {
            newThemeJson.settings.useRootPaddingAwareAlignments = existingThemeJson.settings.useRootPaddingAwareAlignments;
          }
          // Keep template parts
          if (existingThemeJson.templateParts) {
            newThemeJson.templateParts = existingThemeJson.templateParts;
          }
          // Keep custom templates
          if (existingThemeJson.customTemplates) {
            newThemeJson.customTemplates = existingThemeJson.customTemplates;
          }
          // Keep blocks customization
          if (existingThemeJson.settings?.blocks) {
            newThemeJson.settings.blocks = existingThemeJson.settings.blocks;
          }
          // Keep gradients
          if (existingThemeJson.settings?.color?.gradients) {
            newThemeJson.settings.color.gradients = existingThemeJson.settings.color.gradients;
          }
        }

        // Write theme.json
        fs.writeFileSync(themeJsonFile, JSON.stringify(newThemeJson, null, 2));
        console.log(green, `[Design System] Generated theme.json: ${themeJsonFile}`);
      }
    },

    handleHotUpdate({ file }) {
      // Rebuild when design-system.json changes
      if (file === resolvedConfigPath) {
        console.log(yellow, '[Design System] Config changed, rebuilding...');
        this.buildStart();
        return [];
      }
    },
  };
}

export default designSystemPlugin;
