const verifyYoutube = (req, res, next) => {
    const { link } = req.body;
    if (!link || link === '') {
      return res.status(200).json({ msg: 'please enter a link' });
    }

    let url;

    try {
      url = new URL(link);

      const resEx =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

      if (!link.match(resEx)) {
        return res.status(200).json({ msg: 'please enter a youtube link' });
      }
    } catch (_) {
      return res.status(200).json({ msg: 'please enter a valid link' });
    }

    next();
};
module.exports = verifyYoutube;
