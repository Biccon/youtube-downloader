const log = require('./js/log.js');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const ytdl = require('ytdl-core');

// Add Event Lintener
let inputFakePath = document.getElementById("fake-path");
let inputRealPath = document.getElementById("path");

$(inputFakePath).on('click', function() {
  $(inputRealPath).click();
});

$(inputRealPath).on('change', function(event) {
  event.preventDefault();
  $(inputFakePath).val(inputRealPath.files[0].path);
});

const videoDownloadSeq = (video, arr, i) => {
  log.addLog(`다음 파일을 진행중입니다. ${arr[i].title}`);
  video = ytdl(arr[i].url);
  video.pipe(fs.createWriteStream(arr[i].path));
  video.on('end', () => {
    if(++i < arr.length)
      videoDownload(video, arr, i);
    else
      log.addLog(`완료되었습니다.`);
  });
}

const downloadYoutube = () => {
  log.addLog(`다운로드를 시작합니다. 다운로드가 안될 경우 입력하신 값들을 다시 확인하세요.(특히 해당 URL이 재생목록이 맞는지 확인바랍니다.)`);

  let playListUrl = document.getElementById("playListUrl").value;
  let format = document.getElementById("format").value;
  let path = document.getElementById("path").files[0].path;
  
  // 재생 목록에서 각 영상들의 URL을 가져오는 작업 필요
  // 재생 목록은 window["ytInitialData"] 에 존재
  request({
    uri:playListUrl,
  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      let arr = [];

      for(let i = 0; i < $('.playlist-video').length; i++) {
        arr.push({url : 'https://www.youtube.com' + $('.playlist-video')[i].attribs.href,
          title : `${$('.yt-ui-ellipsis')[i].children[0].data.trim()}`,
          path : `${path}\\${$('.yt-ui-ellipsis')[i].children[0].data.trim()}.${format}`
        });
      }

      videoDownloadSeq(null, arr, 0);  // 다운로드 시작
    } else {
      console.error(error);
    }
  });

  return false;
}