'use strict';

function asset(data) {
  data.content = data.content.replace(/!{1}\[([^\[\]]*)\]\((\S*)\s?(?:".*")?\)/g, function(matchStr, label, path) {
    const arr = path.split('/')
    if (arr.length == 2) {
      hexo.log.i('Update asset: %s => %s', path, arr[1])
      return `![${label}](${arr[1]})`
    }
    return matchStr
  })
  return data
}

hexo.extend.filter.register('before_post_render', asset, 0)

hexo.log.i('Load script asset success')
