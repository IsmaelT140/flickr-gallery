class FlickrGallery {
	constructor(location) {
		this.term = "dog"
		this.location = location
		this.container = document.getElementById("photoContainer")
		this.page = 1
		this.perPage = 5
		this.currentPhotoIndex = 0
		this.photos = []
		this.isLoading = false

		document
			.getElementById("nextPhoto")
			.addEventListener("click", this.displayNextPhoto.bind(this))
	}

	displayNextPhoto() {
		if (this.isLoading) {
			return
		}

		this.currentPhotoIndex += 1

		if (this.currentPhotoIndex < this.photos.length) {
			let photoObject = this.photos[this.currentPhotoIndex]
			this.displayPhotoObject(photoObject)
		} else {
			this.page += 1
			this.currentPhotoIndex = 0
			this.fetchDataFromFlickr()
		}
	}

	displayPhotoObject(photoObj) {
		let imageUrl = this.constructImageURL(photoObj)
		let img = document.createElement("img")
		img.src = imageUrl
		this.container.innerHTML = ""
		this.container.append(img)
	}

	processFlickrResponse(parsedResponse) {
		this.setLoading(false)
		this.photos = parsedResponse.photos.photo
		if (this.photos.length > 0) {
			let firstPhotoObject = this.photos[this.currentPhotoIndex]
			this.displayPhotoObject(firstPhotoObject)
		} else {
			this.container.innerHTML = "No More Pictures!"
		}
	}

	setLoading(isLoading) {
		let loadingSpan = document.getElementById("loading")
		if (isLoading) {
			this.isLoading = true
			loadingSpan.classList.toggle("hidden")
			loadingSpan.innerHTML = "Loading..."
		} else {
			this.isLoading = false
			loadingSpan.classList.toggle("hidden")
			loadingSpan.innerHTML = ""
		}
	}

	fetchDataFromFlickr() {
		let url = this.generateApiUrl()
		let fetchPromise = fetch(url)

		this.setLoading(true)

		fetchPromise
			.then((response) => response.json())
			.then((parsedResponse) =>
				this.processFlickrResponse(parsedResponse)
			)
	}

	generateApiUrl() {
		return (
			"https://shrouded-mountain-15003.herokuapp.com/https://flickr.com/services/rest/" +
			"?api_key=97022c3ec5d629b999b722e9bd140543" +
			"&format=json" +
			"&nojsoncallback=1" +
			"&method=flickr.photos.search" +
			"&safe_search=1" +
			"&per_page=" +
			this.perPage +
			"&page=" +
			this.page +
			"&text=" +
			this.term +
			"&lat=" +
			this.location.latitude +
			"&lon=" +
			this.location.longitude
		)
	}

	constructImageURL(photoObj) {
		return (
			"https://farm" +
			photoObj.farm +
			".staticflickr.com/" +
			photoObj.server +
			"/" +
			photoObj.id +
			"_" +
			photoObj.secret +
			".jpg"
		)
	}
}

function onGeolocationSuccess(data) {
	let location = data.coords
	let gallery = new FlickrGallery(location)

	gallery.fetchDataFromFlickr()
}

function onGeolocationError(error) {
	console.error(error)

	let fallbackLocation = {
		latitude: 19.432608,
		longitude: -99.133209,
	}

	let gallery = new FlickrGallery(fallbackLocation)
	gallery.fetchDataFromFlickr()
}

navigator.geolocation.getCurrentPosition(
	onGeolocationSuccess,
	onGeolocationError
)
