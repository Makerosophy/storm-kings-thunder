import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { excerptFromMarkdown } from '../utils/seo';

export async function GET(context) {
	const posts = await getCollection('blog');

	if (!context.site) {
		return new Response('', {
			status: 200,
			headers: {
				'content-type': 'application/xml; charset=utf-8',
			},
		});
	}

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			description: excerptFromMarkdown(post.body ?? post.data.description),
			link: `/blog/${post.id}/`,
		})),
	});
}
