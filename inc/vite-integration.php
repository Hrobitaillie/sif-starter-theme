<?php
/**
 * Vite Integration
 * Gère le chargement des assets en mode dev (HMR) et production
 *
 * @package SifStarterTheme
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Detect if Vite dev server is running
 *
 * @return bool True if dev server is running
 */
function sif_is_vite_dev_server_running() {
    static $is_running = null;

    if ($is_running !== null) {
        return $is_running;
    }

    // Check if dev server is accessible
    $dev_server_url = 'http://localhost:5173';
    $response = wp_remote_get($dev_server_url, [
        'timeout' => 1,
        'sslverify' => false,
    ]);

    $is_running = !is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200;

    return $is_running;
}

/**
 * Get manifest from Vite build
 *
 * @return array|null Manifest data or null if not found
 */
function sif_get_vite_manifest() {
    static $manifest = null;

    if ($manifest !== null) {
        return $manifest;
    }

    $manifest_path = SIF_THEME_DIR . '/assets/dist/.vite/manifest.json';

    if (!file_exists($manifest_path)) {
        return null;
    }

    $manifest_content = file_get_contents($manifest_path);
    $manifest = json_decode($manifest_content, true);

    return $manifest;
}

/**
 * Enqueue Vite assets (dev or production)
 */
function sif_enqueue_vite_assets() {
    $is_dev = sif_is_vite_dev_server_running();

    if ($is_dev) {
        // Mode développement - charger depuis le serveur Vite avec HMR
        wp_enqueue_script(
            'sif-vite-client',
            'http://localhost:5173/@vite/client',
            [],
            null,
            false
        );

        wp_enqueue_script(
            'sif-main',
            'http://localhost:5173/assets/src/main.js',
            [],
            null,
            true
        );

        // Ajouter l'attribut type="module"
        add_filter('script_loader_tag', function($tag, $handle) {
            if (in_array($handle, ['sif-vite-client', 'sif-main'])) {
                $tag = str_replace(' src', ' type="module" src', $tag);
            }
            return $tag;
        }, 10, 2);

    } else {
        // Mode production - charger les assets buildés
        $manifest = sif_get_vite_manifest();

        if (!$manifest) {
            // Si le manifest n'existe pas, afficher un message d'erreur pour les admins
            if (current_user_can('manage_options')) {
                add_action('admin_notices', function() {
                    echo '<div class="notice notice-error"><p>';
                    echo '<strong>Sif Starter Theme:</strong> Les assets n\'ont pas été compilés. ';
                    echo 'Exécutez <code>npm run build</code> dans le dossier du thème.';
                    echo '</p></div>';
                });
            }
            return;
        }

        // Charger le CSS principal
        if (isset($manifest['assets/src/main.js']['css'])) {
            foreach ($manifest['assets/src/main.js']['css'] as $css_file) {
                wp_enqueue_style(
                    'sif-main-' . basename($css_file, '.css'),
                    SIF_THEME_URI . '/assets/dist/' . $css_file,
                    [],
                    SIF_THEME_VERSION
                );
            }
        }

        // Charger le JS principal
        if (isset($manifest['assets/src/main.js']['file'])) {
            wp_enqueue_script(
                'sif-main',
                SIF_THEME_URI . '/assets/dist/' . $manifest['assets/src/main.js']['file'],
                [],
                SIF_THEME_VERSION,
                true
            );

            // Ajouter l'attribut type="module"
            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'sif-main') {
                    $tag = str_replace(' src', ' type="module" src', $tag);
                }
                return $tag;
            }, 10, 2);
        }
    }
}
add_action('wp_enqueue_scripts', 'sif_enqueue_vite_assets');

/**
 * Enqueue block assets (for Gutenberg iframe and frontend)
 *
 * Note: enqueue_block_assets charge les styles dans l'iframe de l'éditeur
 * contrairement à enqueue_block_editor_assets qui ne charge que dans la page admin
 */
function sif_enqueue_block_assets() {
    // Seulement dans l'éditeur admin, pas sur le frontend (déjà chargé via wp_enqueue_scripts)
    if (!is_admin()) {
        return;
    }

    $is_dev = sif_is_vite_dev_server_running();

    if (!$is_dev) {
        $manifest = sif_get_vite_manifest();

        if ($manifest && isset($manifest['assets/src/main.js']['css'])) {
            foreach ($manifest['assets/src/main.js']['css'] as $css_file) {
                wp_enqueue_style(
                    'sif-editor-' . basename($css_file, '.css'),
                    SIF_THEME_URI . '/assets/dist/' . $css_file,
                    [],
                    SIF_THEME_VERSION
                );
            }
        }
    }
}
add_action('enqueue_block_assets', 'sif_enqueue_block_assets');
