const blocksTablesOBJ = [];

$(document).ready(() => {
	/**
	 * Définition des sélecteurs
	 */
	const blocksTables = $(".wp-block-fourmi-e-table-articles");

	/* Création des instances de tableBlock */
	blocksTables.each(function () {
		blocksTablesOBJ.push(new tableBlock($(this)));
	});
	//console.dir(blocksTablesOBJ[0].pagination);
});

/** Classe représentant tout le système Table */
class tableBlock {
	actualPage = 1;
	mediaPage = 1;
	/**
	 * Créer une instance Table et l'initialise.
	 * @param {jQuery} block
	 */
	constructor(block) {
		this.block = block;
		this.variable = `block_${block.attr("id").replace(/-/g, "_")}`;
		this.tagsNames = [];
		this.medias = [];
		if (!window.medias) {
			window.medias = [];
		}

		this.pagesArray = [];
		this.pagination = new Pagination(this, this.block);
		this.getTagsNames();
		this.getMedias(this.mediaPage);
		/*----*/
		this.tableArticle = this.block.find(".table-article");
		this.tableBody = this.tableArticle.find("tbody");
		this.imgWrap = this.block.find(".table-img-wrap");
		this.addTableBodyEvent();
	}
	addTableBodyEvent() {
		let _this = this;
		this.tableBody.children().on("mouseenter", function () {
			let _tr_id = $(this).attr("data-value");
			_this.imgWrap
				.children()
				.filter(function () {
					return $(this).attr("data-value") === _tr_id;
				})
				.addClass("show");
		});
		this.tableBody.children().on("mouseleave", function () {
			let _tr_id = $(this).attr("data-value");
			_this.imgWrap
				.children()
				.filter(function () {
					return $(this).attr("data-value") === _tr_id;
				})
				.removeClass("show");
		});
	}
	removeTableBodyEvent() {
		//	let _this = this;
		this.tableBody.children().off("mouseenter");
		this.tableBody.children().off("mouseleave");
	}
	async updateContent(posts, queryNumber) {
		let _this = this;
		this.removeTableBodyEvent();
		this.tableBody.fadeOut(300, function () {
			_this.tableBody.html("");
			_this.imgWrap.html("");
			posts.map(async (post) => {
				_this.tableBody.append(_this.constructRow(post));
				/* imgs */

				if (post.featured_media !== 0) {
					let result = await window.medias.find(
						(media) => media.id === post.featured_media
					);

					while (!result) {
						// _this.mediaPage += 1;
						await _this.getOneMedia(post.featured_media);
						result = await window.medias.find(
							(media) => media.id === post.featured_media
						);
					}
					_this.imgWrap.append(_this.constructImage(post, result));
				}
			});
			_this.actualPage = queryNumber;
			_this.pagination.arrowsCheck();
			_this.pagination.numberCheck();
			_this.addTableBodyEvent();
			_this.tableBody.fadeIn(200);
		});
	}
	constructImage = (post, media) => {
		return `
			<figure data-value="${post.id}">
				<img
					src="${media.source_url}"
					class="attachment-post-thumbnail size-post-thumbnail wp-post-image"
					alt="${media.alt_text}"
					loading="lazy"
					srcset="${this.imageCreateSrcSet(media.media_details.sizes)}"
					sizes="(max-width: ${media.media_details.width}px 100vw, ${
			media.media_details.width
		}px)"
					width="${media.media_details.width}"
					height="${media.media_details.height}"
				/>
			</figure>
		`;
	};
	imageCreateSrcSet = (sizes) => {
		let srcResult = "";
		for (const [index, [key, value]] of Object.entries(Object.entries(sizes))) {
			if (key !== "thumbnail") {
				srcResult += `${value.source_url} ${value.width}w`;
				if (index < Object.entries(Object.entries(sizes)).length - 1) {
					srcResult += ", ";
				}
			}
		}
		return srcResult;
	};
	constructRow(post) {
		const { displayOptions } = window[this.variable];
		const {
			table: { date, etiquette },
		} = displayOptions;
		let _date =
			date && post.date
				? new Date(post.date).toLocaleDateString("en-US", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
				  })
				: null;
		let _tags =
			etiquette && post.tags && post.tags.length
				? post.tags
						.map((postTag) => {
							return this.tagsNames.find((tag) => tag.id === postTag)?.name;
						})
						.join(", ")
				: null;
		return `
			<tr data-value="${post.id}">
				<td scope="row" class="data-post-title">
					<a href="${post.link}">${post.title.rendered}</a>
				</td>
				${
					_date !== null
						? `<td class="data-post-date">
							<a href="${post.link}">${_date}</a>
							</td>`
						: ""
				}
				${
					_tags !== null
						? `<td class="data-post-tags">
							<a href="${post.link}">${_tags}</a>
							</td>`
						: '<td class="data-post-tags">	</td>'
				}

			</tr>
		`;
	}
	getPage(queryNumber) {
		let _this = this;
		if (this.pagesArray[queryNumber - 1]) {
			this.updateContent(this.pagesArray[queryNumber - 1], queryNumber);
		} else {
			wp.apiFetch({ path: _this.constructQueryPath(queryNumber) }).then(
				(posts) => {
					this.updateContent(posts, queryNumber);
					this.pagesArray[queryNumber - 1] = posts;
				}
			);
		}
	}
	constructQueryPath(queryNumber) {
		const { query } = window[this.variable];
		const { offset, order, orderBy, pages, perPage, postType, tagIds } = query;
		let _correctType = postType === "artiste" ? postType : `${postType}s`;
		let _tags = tagIds.length ? `&tags=${tagIds}` : null;
		let _perPage = perPage ? `&per_page=${perPage}` : null;
		let _page = `&page=${queryNumber}`;
		let _offset = offset ? `&offset=${offset}` : null;
		let _order = order ? `&order=${order}` : null;
		let _orderBy = orderBy ? `&order_by=${orderBy}` : null;
		const options =
			"&_fields[]=id&_fields[]=title&_fields[]=date&_fields[]=tags&_fields[]=link&_fields[]=featured_media";
		return `/wp/v2/${_correctType}?${_tags !== null ? _tags : ""}${
			_perPage !== null ? _perPage : ""
		}${_page}${_offset !== null ? _offset : ""}${
			_order !== null ? _order : ""
		}${_orderBy !== null ? _orderBy : ""}${options}`;
	}

	getTagsNames = () => {
		wp.apiFetch({ path: "/wp/v2/tags" }).then((tags) => {
			tags.map((tag) => {
				this.tagsNames = [...this.tagsNames, { id: tag.id, name: tag.name }];
			});
		});
	};

	getMedias = async (p) => {
		await wp
			.apiFetch({
				path: `/wp/v2/media?per_page=20&page=${p}&_fields[]=id&_fields[]=source_url&_fields[]=alt_text&_fields[]=media_details`,
			})
			.then((_medias) => {
				_medias.map((_media) => {
					// window.medias = [...window.medias, { ..._media }];
					!window.medias.find((media) => media.id === _media.id) &&
						(window.medias = [...window.medias, { ..._media }]);
				});
			});
	};
	getOneMedia = async (id) => {
		await wp
			.apiFetch({
				path: `/wp/v2/media/${id}?_fields[]=id&_fields[]=source_url&_fields[]=alt_text&_fields[]=media_details`,
			})
			.then((_media) => {
				// window.medias = [...window.medias, _media];
				!window.medias.find((media) => media.id === _media.id) &&
					(window.medias = [...window.medias, { ..._media }]);
			});
	};

	getActualPage() {
		return this.actualPage;
	}
}

class Pagination {
	storePagination = {
		buttons: {
			plus: null,
			moins: null,
		},
		numberSymbols: [],
		numberHTMLsave: [],
	};
	limitElement = 7;
	range = 1;
	dotInterface = false;

	constructor(parentThis, parentBlock) {
		this.actualPage = () => parentThis.getActualPage();
		this.getPage = (queryNumber) => parentThis.getPage(queryNumber);
		this.paginationWrap = parentBlock.find(".pagination");

		this.paginationElements = { numbers: [] };

		this.storeElements({
			buttons: true,
			numberSymbols: true,
			numberHTML: true,
		});
		this.checkNumberLength();
		// this.addEvents();
	}

	checkNumberLength() {
		//	console.log(this.storePagination.numberHTMLsave.length);
		//this.storePagination.numberSymbols = []
		if (this.storePagination.numberHTMLsave.length > this.limitElement) {
			this.dotInterface = true;
			this.updateNumberDot();
		} else {
			// this.storeElements({
			// 	numberSymbols: true,
			// });
			this.storeElements({
				numberSymbols: true,
			});
			this.addEvents();
		}
	}
	constructLInumber(_n = undefined) {
		let result = null;
		let tempActualPage = this.actualPage();

		if (_n === undefined || _n < 0) {
			result = `<li><span class="page-numbers current" >…</span></li>`;
		} else {
			if (_n === tempActualPage - 1) {
				result = `<li><span aria-current="page" class="page-numbers current">${
					_n + 1
				}</span></li>`;
			} else if (!$(this.storePagination.numberHTMLsave[_n]).is("a")) {
				let url = window.location.href;
				result = `<li><a class="page-numbers" href="${url}page/${_n + 1}/">${
					_n + 1
				}</a></li>`;
			} else {
				//console.log(_n);
				result = `<li>${this.storePagination.numberHTMLsave[_n]}</li>`;
			}
		}

		return result;
	}
	updateNumberDot() {
		let tempActualPage = this.actualPage();
		let tempNumbers = [];
		//console.log("updateNumberDot");
		let elementToShow = 7;
		let numberToDispatch = this.range * 2 + 1;

		/* Ajout du nombre de la page actuelle */
		tempNumbers.push(this.constructLInumber(tempActualPage - 1));
		numberToDispatch -= 1;

		/* Ajout des nombres de bord de la page actuelle */
		for (let i = 1; i <= 2; i++) {
			if (
				this.storePagination.numberHTMLsave[tempActualPage - 1 - i] &&
				numberToDispatch > 0
			) {
				tempNumbers.unshift(this.constructLInumber(tempActualPage - 1 - i));
				numberToDispatch -= 1;
			}
			if (
				this.storePagination.numberHTMLsave[tempActualPage - 1 + i] &&
				numberToDispatch > 0
			) {
				tempNumbers.push(this.constructLInumber(tempActualPage - 1 + i));
				numberToDispatch -= 1;
			}
		}

		let restElementToShow = elementToShow - (this.range * 2 + 1 - numberToDispatch);

		if (tempNumbers.length < restElementToShow) {
			let pre = tempActualPage - 1 > 1 ? 1 : 0;
			let suf =
				tempActualPage - 1 < this.storePagination.numberHTMLsave.length - 2
					? 1
					: 0;

			for (let i = 0; i < restElementToShow - pre - suf; i++) {
				if (tempActualPage <= 1 + this.range * 2) {
					tempNumbers.push(this.constructLInumber());
				} else if (tempActualPage > this.storePagination.numberHTMLsave.length - 2 - this.range) {
					tempNumbers.unshift(this.constructLInumber());
				} else {
					if (!i) {
						tempNumbers.unshift(this.constructLInumber());
					} else {
						tempNumbers.push(this.constructLInumber());
					}
				}
			}
		}

		/* Ajout des nombres limites */
		if (tempActualPage - 1 > 1) {
			tempNumbers.unshift(this.constructLInumber(0));
		}

		if (tempActualPage - 1 < this.storePagination.numberHTMLsave.length - 2) {
			tempNumbers.push(
				this.constructLInumber(this.storePagination.numberHTMLsave.length - 1)
			);
		}

		this.removeEvents();
		this.storePagination.numberSymbols.map((n) => {
			n.remove();
		});
		this.storePagination.buttons.moins.after(tempNumbers);

		this.storeElements({
			numberSymbols: true,
		});
		this.addEvents();
		this.arrowsCheck();
	}

	storeElements(
		options = { buttons: false, numberSymbols: false, numberHTML: false }
	) {
		const { buttons, numberSymbols, numberHTML } = options;

		buttons &&
			(this.storePagination.buttons = {
				plus: null,
				moins: null,
			});
		numberSymbols && (this.storePagination.numberSymbols = []);
		numberHTML && (this.storePagination.numberHTMLsave = []);

		if (this.paginationWrap.length) {
			let _this = this;
			this.paginationWrap.children().each(function () {
				if ($(this).hasClass("plus")) {
					buttons && (_this.storePagination.buttons.plus = $(this));
					/*
					_this.paginationElements = {
						..._this.paginationElements,
						plus: $(this),
					};
					*/
				} else if ($(this).hasClass("moins")) {
					buttons && (_this.storePagination.buttons.moins = $(this));
					/*
					_this.paginationElements = {
						..._this.paginationElements,
						moins: $(this),
					};
					*/
				} else {
					let __this = $($(this));
					numberSymbols &&
						(_this.storePagination.numberSymbols = [
							..._this.storePagination.numberSymbols,
							__this,
						]);
					/*_this.paginationElements = {
						..._this.paginationElements,
						numbers: [..._this.paginationElements.numbers, __this],
					};*/
					numberHTML &&
						(_this.storePagination.numberHTMLsave = [
							..._this.storePagination.numberHTMLsave,
							__this.html(),
						]);
				}
			});
			this.arrowsCheck();
		}
	}
	arrowsCheck() {
		// let maxNumPage = this.paginationElements.numbers.length;
		let maxNumPage = this.storePagination.numberHTMLsave.length;

		if (this.actualPage() === maxNumPage) {
			this.storePagination.buttons.plus.addClass("hide");
		} else {
			this.storePagination.buttons.plus.removeClass("hide");
		}
		if (this.actualPage() === 1) {
			this.storePagination.buttons.moins.addClass("hide");
		} else {
			this.storePagination.buttons.moins.removeClass("hide");
		}
	}

	numberCheck() {
		let _this = this;
		let url = window.location.href;
		if (!this.dotInterface) {
			this.storePagination.numberSymbols.map((number, index) => {
				if (index === _this.actualPage() - 1) {
					if (number.children().is("a")) {
						number.html(`
				<span aria-current="page" class="page-numbers current">${index + 1}</span>
				`);
					}
				} else {
					if (!number.children().is("a")) {
						number.html(`
				<a class="page-numbers" href="${url}page/${index + 1}/">${index + 1}</a>
				`);
					}
				}
			});
		} else {
			this.updateNumberDot();
		}
	}

	addEvents() {
		if (this.paginationWrap.length) {
			let _this = this;
			// this.paginationElements.numbers.map((number) => {
			this.storePagination.numberSymbols.map((number) => {
				number.on("click", function (e) {
					e.preventDefault();
					if (number.children().is("a")) {
						//Récupérer l'avant dernier caractère pour avoir le numéro de la page.
						const regAfterSlash = /\/([0-9]+)/;
						let queryPage = parseInt(
							number.children().attr("href").match(regAfterSlash)[1]
						);
						_this.getPage(queryPage);
					}
				});
			});
		}
		if (this.storePagination.buttons.plus) {
			let _this = this;

			this.storePagination.buttons.plus.on("click", function () {
				let maxNumPage = !_this.dotInterface
					? _this.storePagination.numberSymbols.length
					: _this.storePagination.numberHTMLsave.length;
				if (_this.actualPage() < maxNumPage) {
					let queryPage = _this.actualPage() + 1;

					_this.getPage(queryPage);
				}
			});
		}
		if (this.storePagination.buttons.moins) {
			let _this = this;
			this.storePagination.buttons.moins.on("click", function () {
				if (_this.actualPage() > 1) {
					let queryPage = _this.actualPage() - 1;
					_this.getPage(queryPage);
				}
			});
		}
	}
	removeEvents() {
		if (this.paginationWrap.length) {
			this.storePagination.numberSymbols.map((number) => number.off("click"));
		}
		if (this.storePagination.buttons.plus) {
			this.storePagination.buttons.plus.off("click");
		}
		if (this.storePagination.buttons.moins) {
			this.storePagination.buttons.moins.off("click");
		}
	}
}
