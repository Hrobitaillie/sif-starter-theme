<?php
// Paramètres du bouton
$btn_type          = sif_maybe_get( $args, 'type', 'btn-primary' );
$btn_icon          = sif_maybe_get( $args, 'icon', 'arrow-right' );
$btn_icon_position = sif_maybe_get( $args, 'icon_position', 'after' );
$btn_class         = sif_maybe_get( $args, 'class', '' );
$btn_title         = sif_maybe_get( $args, 'title', '' );
$btn_link          = sif_maybe_get( $args, 'link', array() );
$btn_target        = sif_maybe_get( $btn_link, 'target', '' );
$btn_download      = sif_maybe_get( $args, 'download', false );
$btn_data          = sif_maybe_get( $args, 'data', array() );
$html_tag          = sif_maybe_get( $args, 'html_tag', '' );
if ( empty( $html_tag ) ) {
    $html_tag = $btn_link ? 'a' : 'button';
}

// Traitement du titre avec around_title
$around_title = sif_maybe_get( $args, 'around_title', apply_filters( 'pib/btn/around_title', null, $args ) );
if ( $around_title && is_array( $around_title ) ) {
    // on entoure le titre avec une balise et des arguments
    $element = sif_maybe_get( $around_title, 'element' );
    $params  = sif_maybe_get( $around_title, 'params' );
    if ( $element && gettype( $element ) === 'string' ) {
        $params    = $params ?: '';
        $before    = sif_maybe_get( $around_title, 'before' ) ?: '';
        $after     = sif_maybe_get( $around_title, 'after' ) ?: '';
        $btn_title = "<$element $params>{$before}{$btn_title}{$after}</$element>";
    }
}

// Traitement du lien
$btn_link_url = false;
if ( $btn_link ) {
    if ( is_string( $btn_link ) ) {
        $btn_link_url = $btn_link;
    }
    if ( is_array( $btn_link ) ) {
        $btn_link_url = sif_maybe_get( $btn_link, 'url' );
        if ( !$btn_title ) {
            $btn_title = sif_maybe_get( $btn_link, 'title' );
        }
        if ( !$btn_target ) {
            $btn_target = sif_maybe_get( $btn_link, 'target' );
        }
    }
}
$btn_link_url = $btn_link_url ?: ( $html_tag === 'a' ? '#' : '' );

// Gestion des attributs rel
$rel_attrs = apply_filters( 'pib/btn/rel', '', $args );
if ( $attr_rel = sif_maybe_get( $args, 'attr_rel' ) ) {
    if ( is_array( $attr_rel ) && !empty( $attr_rel ) ) {
        $rel_attrs = implode( ' ', array_map( 'esc_attr', $attr_rel ) );
    }
}

// Gestion des attributs data-
$data_attrs = apply_filters( 'pib/btn/data', '', $args );
if ( is_array( $btn_data ) && !empty( $btn_data ) ) {
    foreach ( $btn_data as $key => $value ) {
        $data_attrs .= ' data-' . esc_attr( $key ) . '="' . esc_attr( $value ) . '"';
    }
}

// Construction des attributs HTML
$html_attrs = array(
    'class'    => esc_attr( trim( $btn_type . ' ' . $btn_class ) ),
    'title'    => $btn_title ? esc_attr( strip_tags( $btn_title ) ) : null,
    'tabindex' => sif_maybe_get( $args, 'tabindex', 0 ),
);

// Attributs spécifiques aux liens
if ( $html_tag === 'a' ) {
    $html_attrs['href']     = esc_url( $btn_link_url );
    $html_attrs['target']   = $btn_target ? esc_attr( $btn_target ) : null;
    $html_attrs['download'] = !empty( $btn_download ) ? esc_attr( basename( $btn_link_url ) ) : null;
    $html_attrs['rel']      = $rel_attrs ?: null;
}

// Attributs personnalisés (attrs)
$custom_attrs = sif_maybe_get( $args, 'attrs', array() );
if ( is_array( $custom_attrs ) && !empty( $custom_attrs ) ) {
    foreach ( $custom_attrs as $key => $value ) {
        $html_attrs[ $key ] = esc_attr( $value );
    }
}

// Génération de l'icône (Lucide)
$icon_html = '';
if ( $btn_icon && $btn_icon !== false ) {
    $icon_html = function_exists('icon') ? icon($btn_icon, ['class' => 'size-8']) : '';
}

?>

<<?php echo $html_tag; ?>
    <?php
    foreach ( $html_attrs as $key => $value ) {
        if ( $value !== null && $value !== '' ) {
            echo " $key=\"$value\"";
        }
    }
    echo $data_attrs;
    ?>
    >
    <?php echo sif_maybe_get( $args, 'before_title', apply_filters( 'pib/btn/before_title', '', $args ) ); ?>
    <?php if ( $btn_icon_position === 'before' && $icon_html ) : ?>
        <?php echo $icon_html; ?>
    <?php endif; ?>
    <span><?php echo $btn_title; ?></span>
    <?php if ( $btn_icon_position === 'after' && $icon_html ) : ?>
        <?php echo $icon_html; ?>
    <?php endif; ?>
    <?php echo sif_maybe_get( $args, 'after_title', apply_filters( 'pib/btn/after_title', '', $args ) ); ?>
</<?php echo $html_tag; ?>>
