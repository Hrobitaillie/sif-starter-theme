<?php
/**
 * Theme Setup
 *
 * @package SifStarterTheme
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Setup theme
 */
function sif_theme_setup() {
    // Add default posts and comments RSS feed links to head
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails
    add_theme_support('post-thumbnails');

    // Enable support for responsive embeds
    add_theme_support('responsive-embeds');

    // Add support for editor styles
    add_theme_support('editor-styles');

    // Enqueue editor styles
    add_editor_style('assets/dist/main.css');

    // Add support for full and wide align images
    add_theme_support('align-wide');

    // Add support for custom line height controls
    add_theme_support('custom-line-height');

    // Add support for experimental link color control
    add_theme_support('experimental-link-color');

    // Add support for custom units
    add_theme_support('custom-units');

    // Add support for custom spacing
    add_theme_support('custom-spacing');

    // Remove core block patterns
    remove_theme_support('core-block-patterns');

    // HTML5 support
    add_theme_support('html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ]);
}
add_action('after_setup_theme', 'sif_theme_setup');

/**
 * Register navigation menus
 */
function sif_register_menus() {
    register_nav_menus([
        'primary' => __('Primary Menu', 'sif-starter-theme'),
        'footer'  => __('Footer Menu', 'sif-starter-theme'),
    ]);
}
add_action('init', 'sif_register_menus');

/**
 * Enqueue theme scripts and styles
 */
function sif_enqueue_assets() {
    // Les assets sont gérés par vite-integration.php
    // Cette fonction est un placeholder pour d'éventuels scripts additionnels
}
add_action('wp_enqueue_scripts', 'sif_enqueue_assets');
