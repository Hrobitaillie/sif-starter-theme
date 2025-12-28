<?php
/**
 * Sif Starter Theme - Functions
 *
 * @package SifStarterTheme
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('SIF_THEME_VERSION', '1.0.0');
define('SIF_THEME_DIR', get_template_directory());
define('SIF_THEME_URI', get_template_directory_uri());

/**
 * Theme Setup
 */
require_once SIF_THEME_DIR . '/inc/theme-setup.php';

/**
 * Vite Integration for asset management
 */
require_once SIF_THEME_DIR . '/inc/vite-integration.php';

/**
 * Block Patterns (optional)
 */
if (file_exists(SIF_THEME_DIR . '/inc/block-patterns.php')) {
    require_once SIF_THEME_DIR . '/inc/block-patterns.php';
}

/**
 * Add theme blocks directory to SiteForge scan paths
 */
add_filter('siteforge/block_scan_paths', function($paths) {
    $theme_blocks = SIF_THEME_DIR . '/blocks';
    if (is_dir($theme_blocks)) {
        $paths[] = $theme_blocks;
    }
    return $paths;
});
