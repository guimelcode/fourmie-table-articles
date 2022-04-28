/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import {
	useBlockProps,
	InspectorControls,
	store as blockEditorStore,
	InnerBlocks,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	FormTokenField,
	ToggleControl,
} from "@wordpress/components";
import {
	withDispatch,
	withSelect,
	useSelect,
	select,
	useDispatch,
} from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";
import { Fragment, useEffect, useState } from "@wordpress/element";
import { createBlock } from "@wordpress/blocks";

import { getTermsInfo, usePostTypes } from "./utils";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./editor.scss";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */

export default function Edit(props) {
	const {
		setAttributes,
		clientId,
		attributes: { actualPostType, blockId, query, displayOptions, lirePlus },
	} = props;

	const {
		perPage,
		offset,
		order,
		orderBy,
		author: selectedAuthorId,
		postType,
		sticky,
		inherit,
		tagIds,
	} = query;

	if (!blockId || blockId !== clientId) {
		setAttributes({ blockId: clientId });
	}

	// const TEMPLATE_BLOCK = [
	// 	[
	// 		"fourmi-e/conteneur-bouton",
	// 		{
	// 			level: "moyen",
	// 			text: "Lire la suite",
	// 			colonnage_withResponsive: true,
	// 			colonnage_simple: 24,
	// 			colonnage_medium_checked: true,
	// 			colonnage_medium: 8,
	// 			// backgroundColor: "#5025ED",
	// 			backgroundColorClass: "bg-indigo-dark",
	// 		},
	// 	],
	// ];
	const TEMPLATE_BLOCK = [
		[
			"fourmi-e/conteneur-bouton",
			{
				...lirePlus,
			},
		],
	];

	const COLORTHEMES = [
		{ label: "Turquoise", value: "turquoise" },
		{ label: "Indigo", value: "indigo" },
		{ label: "Corail", value: "corail" },
	];

	const { replaceInnerBlocks } = useDispatch("core/block-editor");
	// const { inner_blocks } = useSelect((select) => ({
	// 	inner_blocks: select("core/block-editor").getBlocks(clientId),
	// }));

	const checkBlockId = () => {
		if (!blockId || blockId !== clientId) {
			setAttributes({ blockId: clientId });
		}
	}

	const { postTypesTaxonomiesMap, postTypesSelectOptions } = usePostTypes();

	// Helper function to get the term id based on user input in terms `FormTokenField`.
	const getTermIdByTermValue = (termsMappedByName, termValue) => {
		// First we check for exact match by `term.id` or case sensitive `term.name` match.
		const termId = termValue?.id || termsMappedByName[termValue]?.id;
		if (termId) return termId;
		/**
		 * Here we make an extra check for entered terms in a non case sensitive way,
		 * to match user expectations, due to `FormTokenField` behaviour that shows
		 * suggestions which are case insensitive.
		 *
		 * Although WP tries to discourage users to add terms with the same name (case insensitive),
		 * it's still possible if you manually change the name, as long as the terms have different slugs.
		 * In this edge case we always apply the first match from the terms list.
		 */
		const termValueLower = termValue.toLocaleLowerCase();
		for (const term in termsMappedByName) {
			if (term.toLocaleLowerCase() === termValueLower) {
				return termsMappedByName[term].id;
			}
		}
	};

	const { authorList, categories, tags } = useSelect((select) => {
		const { getEntityRecords } = select(coreStore);
		const termsQuery = { per_page: 3 };
		const _categories = getEntityRecords("taxonomy", "category", termsQuery);
		const _tags = getEntityRecords("taxonomy", "post_tag", termsQuery);
		return {
			categories: getTermsInfo(_categories),
			tags: getTermsInfo(_tags),
			authorList: getEntityRecords("root", "user", {
				per_page: -1,
			}),
		};
	}, []);

	/**
	 * Get taxonomie list from post
	 * Pas utilisé !!!
	 */
	const { taxoList } = useSelect((select) => {
		return {
			taxoList: select("core").getEntityRecords("taxonomy", "post_tag"),
		};
	}, []);

	const onPostTypeChange = (newValue) => {
		const updateQuery = { postType: newValue };
		if (!postTypesTaxonomiesMap[newValue].includes("category")) {
			updateQuery.categoryIds = [];
		}
		if (!postTypesTaxonomiesMap[newValue].includes("post_tag")) {
			updateQuery.tagIds = [];
		}
		if (newValue !== "post") {
			updateQuery.sticky = "";
		}
		// console.log(postTypesSelectOptions.find((o) => o.value === newValue));

		// console.log(updateQuery);
		// setQuery( updateQuery );
		setAttributes({
			query: { ...query, ...updateQuery },
			actualPostType: postTypesSelectOptions.find((o) => o.value === newValue)
				.label,
		});
		checkBlockId()
	};

	const onTermsChange = (terms, queryProperty) => (newTermValues) => {
		const termIds = Array.from(
			newTermValues.reduce((accumulator, termValue) => {
				const termId = getTermIdByTermValue(terms.mapByName, termValue);
				if (termId) accumulator.add(termId);
				return accumulator;
			}, new Set())
		);
		setAttributes({ query: { ...query, [queryProperty]: termIds } });
		checkBlockId()
	};
	const onCategoriesChange = onTermsChange(categories, "categoryIds");
	const onTagsChange = onTermsChange(tags, "tagIds");

	const onPerPageChange = (newValue) => {
		setAttributes({
			query: { ...query, perPage: newValue },
		});
		checkBlockId()
	};

	const onOffsetChange = (newValue) => {
		setAttributes({
			query: { ...query, offset: newValue },
		});
		checkBlockId()
	};

	const getExistingTermsFormTokenValue = (taxonomy) => {
		const termsMapper = {
			category: {
				queryProp: "categoryIds",
				terms: categories,
			},
			post_tag: {
				queryProp: "tagIds",
				terms: tags,
			},
		};
		const requestedTerm = termsMapper[taxonomy];
		return (query[requestedTerm.queryProp] || []).reduce(
			(accumulator, termId) => {
				const term = requestedTerm.terms.mapById[termId];
				if (term) {
					accumulator.push({
						id: termId,
						value: term.name,
					});
				}
				return accumulator;
			},
			[]
		);
	};

	const { resultForEditDisplay } = useSelect((select) => {
		const currentPostId = select("core/editor").getCurrentPostId();
		const _query = {
			per_page: perPage,
			exclude: currentPostId,
			tags: tagIds,
			offset: offset,
		};
		return {
			resultForEditDisplay: select("core").getEntityRecords(
				"postType",
				postType,
				_query
			),
		};
	});

	const reconstructInnerBlock = () => {
		let inner_blocks_new = [
			createBlock("fourmi-e/conteneur-bouton", {
				...lirePlus,
			}),
		];
		replaceInnerBlocks(clientId, inner_blocks_new, false);
	};

	useEffect(() => {
		reconstructInnerBlock();
	}, [lirePlus]);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody>
					<SelectControl
						label={__("Selected Post Type", "fourmi-e")}
						options={postTypesSelectOptions}
						value={postType}
						onChange={
							// setAttributes({
							// 	query: { ...props.attributes.query, postType: value },
							// });
							onPostTypeChange
						}
					/>
					{postTypesTaxonomiesMap?.[postType].length &&
					tags?.terms?.length > 0 ? (
						<FormTokenField
							value={getExistingTermsFormTokenValue("post_tag")}
							suggestions={tags.names}
							onChange={onTagsChange}
						/>
					) : null}
				</PanelBody>
				<PanelBody>
					<NumberControl
						label={__("Nombre d'entrées par page", "fourmi-e")}
						onChange={onPerPageChange}
						value={perPage}
						min={-1}
					/>
					<ToggleControl
						label={__("Présenter tout les entrée", "fourmi-e")}
						onChange={() => {
							setAttributes({
								displayOptions: {
									...displayOptions,
									table: {
										...displayOptions.table,
										allResult: !displayOptions.table.allResult,
									},
								},
							});
							if (!displayOptions.table.allResult === false) {
								setAttributes({
									lirePlus: {
										...lirePlus,
										colonnage_withStart: true,
										colonnage_medium_start: 17,
									},
								});
							} else {
								setAttributes({
									lirePlus: {
										...lirePlus,
										colonnage_withStart: false,
										colonnage_medium_start: 1,
									},
								});
							}
						}}
						help={displayOptions.table.allResult ? "Oui" : "Non"}
						checked={displayOptions.table.allResult}
					/>
				</PanelBody>
				<PanelBody>
					<NumberControl
						label={__("Décalage des résultats", "fourmi-e")}
						onChange={onOffsetChange}
						value={offset}
						min={0}
					/>
				</PanelBody>
				<PanelBody>
					<ToggleControl
						label={__("is Date ?", "fourmi-e")}
						help={displayOptions.table.date ? "Oui" : "Non"}
						checked={displayOptions.table.date}
						onChange={() =>
							setAttributes({
								displayOptions: {
									...displayOptions,
									table: {
										...displayOptions.table,
										date: !displayOptions.table.date,
									},
								},
							})
						}
					/>
					<ToggleControl
						label={__("is Étiquette ?", "fourmi-e")}
						help={displayOptions.table.etiquette ? "Oui" : "Non"}
						checked={displayOptions.table.etiquette}
						onChange={() =>
							setAttributes({
								displayOptions: {
									...displayOptions,
									table: {
										...displayOptions.table,
										etiquette: !displayOptions.table.etiquette,
									},
								},
							})
						}
					/>
					<ToggleControl
						label={__("is More ?", "fourmi-e")}
						help={displayOptions.table.more ? "Oui" : "Non"}
						checked={displayOptions.table.more}
						onChange={() =>
							setAttributes({
								displayOptions: {
									...displayOptions,
									table: {
										...displayOptions.table,
										more: !displayOptions.table.more,
									},
								},
							})
						}
					/>
					<SelectControl
						label={__("Selected Post Type", "fourmi-e")}
						options={COLORTHEMES}
						value={displayOptions.colorTheme}
						onChange={(newValue) => {
							setAttributes({
								displayOptions: {
									...displayOptions,
									colorTheme: newValue,
								},
								lirePlus: {
									...lirePlus,
									backgroundColorClass: `bg-${newValue}-dark`,
								},
							});
							// console.log(`bg-${newValue}-base`);
							// let inner_blocks_new = [
							// 	createBlock("fourmi-e/conteneur-bouton", {
							// 		text: "Lire la suite",
							// 		level: "moyen",
							// 		colonnage_simple: 24,
							// 		colonnage_withResponsive: true,
							// 		colonnage_medium_checked: true,
							// 		colonnage_medium: 8,

							// 		backgroundColorClass: `bg-${newValue}-dark`,
							// 	}),
							// ];
							// replaceInnerBlocks(clientId, inner_blocks_new, false);
						}}
					/>
				</PanelBody>
			</InspectorControls>
			<div
				{...useBlockProps()}
				className={`${useBlockProps().className} table-theme-${
					displayOptions.colorTheme
				} bg-${displayOptions.colorTheme}-base `}
			>
				<div
					className={`conteneur col-24 col-md-16 bg-${displayOptions.colorTheme}-light`}
				>
					<table className="table-article">
						<thead>
							<tr>
								{actualPostType && (
									<th className="head-post-type">{actualPostType}</th>
								)}
								{displayOptions.table.date && (
									<th className="head-post-date">Date</th>
								)}
								{displayOptions.table.etiquette && (
									<th className="head-post-tags">Étiquettes</th>
								)}
							</tr>
						</thead>
						<tbody>
							{resultForEditDisplay &&
								resultForEditDisplay.map((result) => (
									<tr data-value={result.id}>
										{result.title && (
											<td>
												<a
													href={result.link}
													onClick={(e) => e.preventDefault()}
													dangerouslySetInnerHTML={{
														__html: result.title.rendered,
													}}
												></a>
											</td>
										)}
										{displayOptions.table.date && result.date && (
											<td>
												<a
													href={result.link}
													onClick={(e) => e.preventDefault()}
												>
													{new Date(result.date).toLocaleDateString()}
												</a>
											</td>
										)}
										{displayOptions.table.etiquette &&
										result.tags &&
										result.tags.length ? (
											<td>
												<a
													href={result.link}
													onClick={(e) => e.preventDefault()}
												>
													{result.tags.map((tag, i) => (
														<>
															{taxoList?.find((o) => o.id === tag)?.name}
															{i < result.tags.length - 1 ? ", " : ""}
														</>
													))}
												</a>
											</td>
										) : (
											<td>
												<a href={result.link}></a>
											</td>
										)}
									</tr>
								))}
						</tbody>
					</table>
				</div>
				<div className="conteneur col-24 col-md-8 bg-blanc"></div>
				{displayOptions.table.more && (
					<>
						<InnerBlocks template={TEMPLATE_BLOCK} />
					</>
				)}
			</div>
		</Fragment>
	);
}
