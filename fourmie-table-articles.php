<?php
/**
 * Plugin Name:       Fourmie Table Articles
 * Description:       Example block written with ESNext standard and JSX support – build step required.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       fourmie-table-articles
 *
 * @package           create-block
 */

function build_query_vars_from_table_block($attributes, $page)
{
    $query = array(
        'post_type' => 'post',
        'order' => 'DESC',
        'orderby' => 'date',
        'post__not_in' => array(),
    );
    if (isset($attributes['query'])) {
        // var_dump($attributes['query']);
        if (isset($attributes['query']['postType'])) {
            $query['post_type'] = $attributes['query']['postType'];
        }
        if (isset($attributes['query']['sticky']) && !empty($attributes['query']['sticky'])) {
            $sticky = get_option('sticky_posts');
            if ('only' === $attributes['query']['sticky']) {
                $query['post__in'] = $sticky;
            } else {
                $query['post__not_in'] = array_merge($query['post__not_in'], $sticky);
            }
        }
        if (isset($attributes['query']['exclude'])) {
            $query['post__not_in'] = array_merge($query['post__not_in'], $attributes['query']['exclude']);
        }
        if (isset($attributes['query']['perPage'])) {
            $query['offset'] = ($attributes['query']['perPage'] * ($page - 1)) + $attributes['query']['offset'];
            $query['posts_per_page'] = $attributes['query']['perPage'];
        }
        if (isset($attributes['query']['categoryIds'])) {
            $query['category__in'] = $attributes['query']['categoryIds'];
        }
        if (isset($attributes['query']['tagIds'])) {
            $query['tag__in'] = $attributes['query']['tagIds'];
        }
        if (isset($attributes['query']['order'])) {
            $query['order'] = strtoupper($attributes['query']['order']);
        }
        if (isset($attributes['query']['orderBy'])) {
            $query['orderby'] = $attributes['query']['orderBy'];
        }
        if (isset($attributes['query']['author'])) {
            $query['author'] = $attributes['query']['author'];
        }
        if (isset($attributes['query']['search'])) {
            $query['s'] = $attributes['query']['search'];
        }

        $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
        $query['paged'] = $paged;

    }
    return $query;
}

function render_table_articles($attributes, $content, $block)
{
    /**
     * Import front script
     */
    if (!is_admin() && file_exists(plugin_dir_path(__FILE__) . 'test.js')) {

        wp_enqueue_script(
            'initiative-tracker-frontend-script',
            plugins_url('./main-table.js', __FILE__),

            array_merge([
                // ['attributes' => $attributes],
                'wp-api-fetch',
                'jquery',
            ]),
            '1',
            true
        );
        wp_localize_script('initiative-tracker-frontend-script', 'block_' . preg_replace('/-/', '_', $attributes['blockId']), $attributes);
    }
    $page_key = isset($block->context['queryId']) ? 'query-' . $block->context['queryId'] . '-page' : 'query-page';
    $page = empty($_GET[$page_key]) ? 1 : (int) $_GET[$page_key];

    $query_args = build_query_vars_from_table_block($attributes, $page);

    $query = new WP_Query($query_args);


    /***** */

    if (!$query->have_posts()) {
        return '';
    }
    $headerTag = $attributes['displayOptions']['table']['etiquette'];
    $header = '';

    $ALLpost = array();
    while ($query->have_posts()) {
        $query->the_post();

        array_push($ALLpost, array(
            'post_id' => get_the_ID(),
            'post_title' => get_the_title(),
            'post_date' => get_the_date('d/m/Y'),
            'post_tags' => get_the_tags(),
            'post_permalink' => get_permalink(),
            'post_thumbnail' => get_the_post_thumbnail(),
            'post_thumbnail_id' => get_post_thumbnail_id(),
        ));

    }

    $header .= "<tr> <th>" . $attributes['actualPostType'] . "</th><th>Date</th>";
    if ($headerTag) {
        $header .= "<th>Étiquettes</th>";
    }
    $header .= "</tr>";

    $cards = [
        'prop' => 2,
    ];


    if ($attributes['displayOptions']['table']['allResult']) {

        $pagination = paginate_links(array(
            'base' => str_replace(999999999, '%#%', esc_url(get_pagenum_link(999999999))),
            'total' => $query->max_num_pages,
            'current' => max(1, get_query_var('paged')),
            'format' => '?paged=%#%',
            'show_all' => true,
            'type' => 'array',
            'end_size' => 2,
            'mid_size' => 1,
            'prev_next' => false,
            'add_args' => false,
            'add_fragment' => '',
        ));
    } else {
        $pagination = null;
    }
    wp_reset_postdata();

    $wrapper_attributes = substr(get_block_wrapper_attributes(array('class' => $classnames)), 0, -1) . ' table-theme-' . $attributes['displayOptions']['colorTheme'] . ' bg-' . $attributes['displayOptions']['colorTheme'] . '-base"';

    return render_view([
        'posts' => $ALLpost,
        'postType' => $attributes['actualPostType'],
        'id' => $attributes['blockId'],
        "hasTags" => $headerTag,
        'attributes' => $wrapper_attributes,
        'pagination' => $pagination,
        'isEtiquette' => $attributes['displayOptions']['table']['etiquette'],
        'isDate' => $attributes['displayOptions']['table']['date'],
        'isMore' => $attributes['displayOptions']['table']['more'],
        'more' => $content,
        'colorTheme' => $attributes['displayOptions']['colorTheme'],
    ]);
}

function render_view($data)
{

    ob_start();
    extract($data);
    include __DIR__ . '/view.php';
    return ob_get_clean();
    // $content = ob_get_clean();
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/writing-your-first-block-type/
 */
function create_block_fourmie_table_articles_block_init()
{
    register_block_type(__DIR__, array(
        'render_callback' => 'render_table_articles',
    ));
}
add_action('init', 'create_block_fourmie_table_articles_block_init');
