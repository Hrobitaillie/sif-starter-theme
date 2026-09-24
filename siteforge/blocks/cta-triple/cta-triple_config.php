<?php
/**
 * Bloc CTA Triple - Configuration
 *
 * Ce fichier est chargé automatiquement lors de l'enregistrement du bloc.
 */

// Exemple: charger un script externe si le bloc est présent
add_action('wp_enqueue_scripts', function () {
    if (!has_block('sif/cta-triple')) {
        return;
    }

    // wp_enqueue_script('example-lib', 'https://cdn.example.com/lib.js', [], '1.0.0', true);
});
