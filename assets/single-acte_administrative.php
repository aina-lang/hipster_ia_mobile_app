<?php
/**
 * Template Single Acte administrative
 *
 * @link https://test.test
 *
 * @package Hysper
 */

get_header();
global $post;
// $telephone = get_field('telephone', $post->ID);
?>
<header class="titre_coimmo">
    <div class="container">
        <div class="row">
            <div class="left_contenue col-md-12">
                <h1>
                    <?= the_title(); ?>
                </h1>
            </div>
            <div class="left_contenue col-md-12">
                <?php echo do_shortcode('[flexy_breadcrumb]'); ?>
            </div>
        </div>
    </div>
</header>
<div class="contenu_post_immo">
    <div class="container">
        <div class="row">
			<?php if (have_rows('tous_les_actes_administratif')): ?>
			<div class="team">
				<?php while (have_rows('tous_les_actes_administratif')): the_row(); ?>
				<div class="team__member">
					<?php
					// Get subfields
					$titre_principales_acte = get_sub_field('titre_principales_acte');
					$sous_titre_principales_acte = get_sub_field('sous_titre_principales_acte');
					$titre_pdf = get_sub_field('titre_pdf');
					$insertion_pdf = get_sub_field('insertion_pdf');

					if ($titre_principales_acte) {
						echo '<div class="titre_actte"><h2 class="titre_acte"><img src="/wp-content/uploads/2025/05/Embassadeur.png" style=" width: 48px; margin-top: -2px; "> ' . esc_html($titre_principales_acte) . '</h2></div>';
					}
					if ($sous_titre_principales_acte) {
						echo '<h3 class="sous_ttitre">' . esc_html($sous_titre_principales_acte) . '</h3>';
					}
					if ($insertion_pdf) {
						if (is_array($insertion_pdf) && !empty($insertion_pdf['url'])) {
						$link_text = $titre_pdf ? esc_html($titre_pdf) : 'Download PDF';
						echo '<a href="' . esc_url($insertion_pdf['url']) . '" target="_blank">' . $link_text . '</a>';
						}
						elseif (is_numeric($insertion_pdf)) {
						$pdf_url = wp_get_attachment_url($insertion_pdf);
						if ($pdf_url) {
							$link_text = $titre_pdf ? esc_html($titre_pdf) : 'Download PDF';
							echo '<a href="' . esc_url($pdf_url) . '" target="_blank">' . $link_text . '</a>';
						} else {
							echo '<p>No valid PDF found.</p>';
						}
						}
						elseif (is_array($insertion_pdf) && have_rows('insertion_pdf')) {
						echo '<ul class="lesdespdf">';
						while (have_rows('insertion_pdf')): the_row();
							$pdf_file = get_sub_field('inserer_les_pdf_');
							$pdf_title = get_sub_field('titre_pdf') ?: ($titre_pdf ?: 'Download PDF');
							if ($pdf_file && !empty($pdf_file['url'])) {
							echo '<li><a href="' . esc_url($pdf_file['url']) . '" target="_blank"><img src="/wp-content/uploads/2025/07/33-332806_pdf-icon-hd-png-download.png"><span>' . esc_html($pdf_title) . '</span></a></li>';
							} elseif (is_numeric($pdf_file)) {
							$pdf_url = wp_get_attachment_url($pdf_file);
							if ($pdf_url) {
								echo '<li><a href="' . esc_url($pdf_url) . '" target="_blank">' . esc_html($pdf_title) . '</a></li>';
							}
							}
						endwhile;
						echo '</ul>';
						} else {
						echo '';
						}
					} else {
						echo '';
					}
					?>
				</div>
				<?php endwhile; ?>
			</div>
			<?php else: ?>
			<p>Pas administrative acts pour le moment...</p>
			<?php endif; ?>
		</div>
	</div>
</div>
<?php
get_footer();