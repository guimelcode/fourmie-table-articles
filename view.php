<?php /* view.php */?>
<div id="<?=$id?>" <?=$attributes?> >
	<div class="conteneur col-24 col-md-16 bg-<?=$colorTheme?>-light">
		<table class="table-article">
			<thead>
				<tr>
					<?php if (!empty($postType)): ?>
						<th scope="col" class="head-post-type">
							<?=$postType?>
						</th>
					<?php endif;?>
					<?php if ($isDate): ?>
						<th scope="col" class="head-post-date">Date</th>
					<?php endif;?>
					<?php if ($isEtiquette): ?>
						<th scope="col" class="head-post-tags">
							Étiquettes
						</th>
					<?php endif;?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($posts as $post): ?>
					<tr data-value="<?=$post['post_id']?>" >
					<?php if (!empty($post['post_title'])): ?>
						<td scope="row" class="data-post-title">
							<a href="<?=$post['post_permalink']?>">
								<?=$post['post_title']?>
							</a>
						</td>
					<?php endif; if (!empty($post['post_date']) && $isDate): ?>
						<td class="data-post-date">
							<a href="<?=$post['post_permalink']?>">
								<?=$post['post_date']?>
							</a>
						</td>
					<?php endif; if ($isEtiquette): ?>
						<td class="data-post-tags">
						<?php if (!empty($post['post_tags'])): ?>
						<?php
							$tagsStr = array();
							foreach ($post['post_tags'] as $tag) {
  								$tagsStr[] = $tag->name;
							}
						?>
							<a href="<?=$post['post_permalink']?>">
								<?=implode(", ", $tagsStr)?>
							</a>
						<?php endif;?>
						</td>
					<?php endif;?>
					</tr>
				<?php endforeach;?>
			</tbody>
		</table>
	</div>
	<div class="conteneur col-24 col-md-8 bg-blanc">
		<div class="table-img-wrap">
			<?php foreach ($posts as $post): ?>
				<?php if (!empty($post['post_thumbnail'])): ?>
					<figure data-value="<?=$post['post_id']?>" thumb-id="<?=$post['post_thumbnail_id']?>">
						<?=$post['post_thumbnail']?>
					</figure>
				<?php endif;?>
			<?php endforeach;?>
		</div>
	</div>
	<?php if (!empty($pagination)): ?>
	<div class="conteneur col-24 col-md-6 col-md-10-start-7 bg-<?=$colorTheme?>-darker">
		<ul class="pagination">
			<li class="moins" > ‹ </li>
			<?php foreach ($pagination as $pagi): ?>
				<li>
					<?=$pagi?>
				</li>
			<?php endforeach;?>
			<li class="plus" > › </li>
		</ul>
	</div>
	<?php endif;?>
	<?php if (!empty($isMore)): ?>
	<?=$more?>
	<?php endif;?>

</div>
