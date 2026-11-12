var f = effect("Posterize FPS")("Slider");
f > 0 ? f : 1 / thisComp.frameDuration;