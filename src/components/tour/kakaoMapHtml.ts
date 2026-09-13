// TourMap이 WebView에 로드하는 정적 HTML. 카카오맵 JS SDK를 불러와 지도를 그리고,
// RN 쪽에서 window.__dotoMap.* 함수를 injectJavaScript로 호출해 마커/중심/줌을 제어한다.
// 마커 클릭 등 WebView -> RN 방향은 window.ReactNativeWebView.postMessage로 보낸다.
//
// 카카오맵 JS SDK는 앱키에 등록된 플랫폼 도메인만 허용한다. 이 HTML은 WebView의 baseUrl을
// http://localhost로 고정해서 로드하므로, 카카오 개발자센터 > 앱 > 플랫폼 > Web에 http://localhost를
// 사이트 도메인으로 등록해야 지도가 정상적으로 뜬다.
export function getKakaoMapHtml(javascriptKey: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<style>
  html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
  .doto-marker { display: flex; flex-direction: column; align-items: center; }
  .doto-marker-pin {
    width: 25px; height: 25px; display: flex; align-items: center; justify-content: center;
    border-radius: 999px; border: 3px solid #FF8076; background: #FFFFFF; box-sizing: border-box;
  }
  .doto-marker-pin.selected { width: 34px; height: 34px; border-width: 4px; background: #FA5144; }
  .doto-marker-pin span { color: #FF675F; font-size: 9px; font-weight: 700; font-family: -apple-system, sans-serif; }
  .doto-marker-pin.selected span { color: #FFFFFF; font-size: 12px; }
  .doto-marker-tail { width: 8px; height: 8px; margin-top: -5px; transform: rotate(45deg); background: #FF8076; }
  .doto-marker-tail.selected { width: 10px; height: 10px; margin-top: -6px; background: #FA5144; }
  .doto-current-location { position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
  .doto-current-location-pulse { position: absolute; width: 48px; height: 48px; border-radius: 999px; background: rgba(53, 139, 255, 0.16); }
  .doto-current-location-dot { width: 16px; height: 16px; border-radius: 999px; border: 3px solid #FFFFFF; background: #358BFF; box-sizing: border-box; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${javascriptKey}&autoload=false"></script>
<script>
  function post(message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  window.onerror = function (message) {
    post({ type: 'error', message: String(message) });
  };

  kakao.maps.load(function () {
    var map = new kakao.maps.Map(document.getElementById('map'), {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 6,
    });

    var markerOverlays = {};
    var currentLocationOverlay = null;

    function clearMarkers() {
      Object.keys(markerOverlays).forEach(function (id) {
        markerOverlays[id].setMap(null);
      });
      markerOverlays = {};
    }

    function setMarkers(markers) {
      clearMarkers();

      markers.forEach(function (marker) {
        var wrapper = document.createElement('div');
        wrapper.className = 'doto-marker';
        wrapper.innerHTML =
          '<div class="doto-marker-pin' + (marker.selected ? ' selected' : '') + '"><span>' + marker.label + '</span></div>' +
          '<div class="doto-marker-tail' + (marker.selected ? ' selected' : '') + '"></div>';
        wrapper.addEventListener('click', function () {
          post({ type: 'markerPress', id: marker.id });
        });

        var overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(marker.lat, marker.lng),
          content: wrapper,
          yAnchor: 1,
          clickable: true,
        });
        overlay.setMap(map);
        markerOverlays[marker.id] = overlay;
      });
    }

    function setCurrentLocation(point) {
      if (currentLocationOverlay) {
        currentLocationOverlay.setMap(null);
        currentLocationOverlay = null;
      }
      if (!point) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'doto-current-location';
      wrapper.innerHTML =
        '<div class="doto-current-location-pulse"></div><div class="doto-current-location-dot"></div>';

      currentLocationOverlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(point.lat, point.lng),
        content: wrapper,
      });
      currentLocationOverlay.setMap(map);
    }

    function setCenter(lat, lng, level) {
      map.setCenter(new kakao.maps.LatLng(lat, lng));
      if (typeof level === 'number') map.setLevel(level);
    }

    function fitBounds(points) {
      if (!points || points.length === 0) return;

      var bounds = new kakao.maps.LatLngBounds();
      points.forEach(function (point) {
        bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
      });
      map.setBounds(bounds);
    }

    window.__dotoMap = {
      setMarkers: setMarkers,
      setCurrentLocation: setCurrentLocation,
      setCenter: setCenter,
      fitBounds: fitBounds,
    };

    post({ type: 'ready' });
  });
</script>
</body>
</html>`;
}
