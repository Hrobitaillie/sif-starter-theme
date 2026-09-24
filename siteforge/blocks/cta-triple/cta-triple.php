<?php
/**
 * Bloc CTA Triple
 *
 * @package SiteForge
 */

// Récupération des champs
$crm = get_field('crm', 'd');
?>

<section <?php sif_attrs('anim-trigger-forward py-16 lg:py-24', $block); ?>>
    <div class="container mx-auto px-4">

        <?php if ($crm): ?>
            <h2 class="text-h2 mb-4"><?php echo text($crm); ?></h2>
        <?php endif; ?>

        <div class="inner-content">
            <InnerBlocks
            allowedBlocks='["core\/paragraph","core\/heading","core\/image","core\/list"]'
            template='[["sif\/buttons",[]],["core\/button",[]],["sif\/process",[]]]'
        />
        </div>
    </div>
</section>
