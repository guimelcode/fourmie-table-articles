/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';

export const getTermsInfo = (terms) => {
	const mapping = terms?.reduce(
		(accumulator, term) => {
			const { mapById, mapByName, names } = accumulator;
			mapById[term.id] = term;
			mapByName[term.name] = term;
			names.push(term.name);
			return accumulator;
		},
		{ mapById: {}, mapByName: {}, names: [] }
	);

	return {
		terms,
		...mapping,
	};
};

export const usePostTypes = () => {
	const { postTypes } = useSelect((select) => {
		const { getPostTypes } = select(coreStore);
		const excludedPostTypes = ['attachment', 'wp_block', 'wp_template'];
		const filteredPostTypes = getPostTypes({ per_page: -1 })?.filter(
			({ viewable, slug }) =>
				viewable && !excludedPostTypes.includes(slug)
		);
		return {
			postTypes: filteredPostTypes,
		};
	}, []);
	const postTypesTaxonomiesMap = useMemo(() => {
		if (!postTypes?.length) return;
		return postTypes.reduce((accumulator, type) => {
			accumulator[type.slug] = type.taxonomies;
			return accumulator;
		}, {});
	}, [postTypes]);
	const postTypesSelectOptions = useMemo(
		() =>
			(postTypes || []).map(({ labels, slug }) => ({
				label: labels.singular_name,
				value: slug,
			})),
		[postTypes]
	);
	return { postTypesTaxonomiesMap, postTypesSelectOptions };
};
