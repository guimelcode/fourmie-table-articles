/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
// import { withDispatch, withSelect, useSelect, select } from "@wordpress/data";

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save(props) {
	const {
		attributes: { queryType, queryTags, blockId },
	} = props;

	// const { resultQuery } = useSelect((select) => {
	// 	const currentPostId = select("core/editor").getCurrentPostId();
	// 	const query = {
	// 		per_page: -1,
	// 		exclude: currentPostId,
	// 		tags: queryTags.values.map((e) => e.id),
	// 	};
	// 	return {
	// 		resultQuery: select("core").getEntityRecords(
	// 			"postType",
	// 			queryType.slug,
	// 			query
	// 		),
	// 	};
	// });
	// const innerBlocksProps = useInnerBlocksProps.save( blockProps );
	console.log(
		'🚀 ~ file: save.js ~ line 27 ~ save ~ props',
		useInnerBlocksProps
	);
	return (
		<div {...useBlockProps.save()}>
			<script type="text/javascript">
				{/* console.log('coucou');
				fetch('http://localhost:8888/WordpressWorkplace/fourmie/wp-json')
				.then(function(response) {

				}) */}
			</script>
			<table>
				<thead>
					<tr>
						<th>{queryType.name}</th>
						<th>Date</th>
						{queryType.slug === 'post' ? <th>Étiquettes</th> : null}
					</tr>
				</thead>
				<tbody>
					{/* {resultQuery?.map((e) => {
						return (
							<tr>
								<td dangerouslySetInnerHTML={{ __html: e.title.rendered }}></td>
								<td>{new Date(e.date).toLocaleDateString()}</td>
								{queryType.slug === "post" && e.tags && e.tags.length ? (
									<td>
										{e.tags.map((item, index) => (
											<>
												{taxoList?.find((o) => o.id === item)?.name}
												{index < e.tags.length - 1 ? ", " : ""}
											</>
										))}
									</td>
								) : null}
							</tr>
						);
					})} */}
				</tbody>
			</table>
		</div>
	);
}
