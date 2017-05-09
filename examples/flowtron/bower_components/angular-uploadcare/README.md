angular-uploadcare
==================

Provides a directive for the [Uploadcare Widget](https://uploadcare.com/documentation/widget/).

Looking for a dead-simple way to integrate image uploading/cropping with your [Angularjs](http://angularjs.org) project? Then look no further! [Uploadcare](https://uploadcare.com) provides a fantastic widget for uploading images from multiple sources.  From their site:

>We handle files, so you don’t have to.
>Uploadcare is a service that helps media creators,
>businesses and developers store, process
>and deliver visual content to their clients.

Combine this with the power of Angular and you've got yourself an image uploading solution that's far better than most other offerings.

*Note: I am in no way affiliated with Uploadcare. I was looking to add better image uploading to an Angular app and found Uploadcare to be one of the best solutions out there. Since there wasn't a directive for Angular, I decided to make one.*

#Usage

* Run `bower install angular-uploadcare` (or manually download/clone and install into your project's directory)
* Include bower_components/angular-uploadcare/angular-uploadcare.js
* Include the desired version of the [Uploadcare Widget](https://uploadcare.com/documentation/widget/). This directive works with at least version 2.1.4 `<script charset="utf-8" src="//ucarecdn.com/widget/2.1.4/uploadcare/uploadcare.min.js"></script>`. If you want use version with jQuery, include `uploadcare.full.min.js` instead of `uploadcare.min.js`.
* Add `ng-uploadcare` as a dependency for your app
* Insert the `uploadcare-widget` directive into your template file:
```
<input
  uploadcare-widget
  ng-model="object.image.info.uuid"
  data-public-key="YOURKEYHERE"
  data-tabs="file url"
  data-images-only="true"
  data-preview-step="true"
  data-clearable="true"
  data-multiple="false"
  data-crop="400:200"
  on-upload-complete="onUCUploadComplete(info)"
  on-widget-ready="onUCWidgetReady(widget)"
  value="{{ object.image.info.cdnUrl }}"
 />
 ```

#Options

This directive supports any of the configuration [options](https://uploadcare.com/documentation/widget/#configuration) defined by Uploadcare. In addition, it also supports the following options:

- `ng-model` The value to bind to
- `on-upload-complete` Fires once the file has been uploaded (and cropped if set). This function will receive the [file](https://uploadcare.com/documentation/javascript_api/#file) object from Uploadcare
- `value` Used to set the value for the input. Useful when you want to prepopulate the input value from elsewhere

# Upgrade guide

## 0.1.x -> 0.2.0

Directive is based on attribute instead of element now, so you should just replace `<uploadcare-widget>` with `<input uploadcare-widget>`

#Contribution

Bring it on! I'll gladly accept PR's that are for the greater good of the module.

#License:

MIT Baby!
