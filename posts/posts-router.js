const router = require("express").Router();

const Posts = require("../data/db");

router.get("", (req, res) => {
  Posts.find()
    .then((posts) => res.status(200).json({ success: true, posts }))
    .catch((err) =>
      res.status(500).json({
        success: false,
        error: "The posts information could not be retrieved",
      })
    );
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  Posts.findById(id)
    .then((post) => {
      console.log(post);
      if (post.length > 0) {
        res.status(200).json({ success: true, post });
      } else {
        res.status(404).json({
          success: false,
          message: "The post with the specified ID does not exist.",
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        success: false,
        error: "The posts information could not be retrieved",
      })
    );
});

router.get("/:id/comments", (req, res) => {
  const { id } = req.params;
  Posts.findById(id).then((post) => {
    if (post.length > 0) {
      Posts.findPostComments(id)
        .then((comment) => res.status(200).json({ success: true, comment }))
        .catch((err) =>
          res.status(500).json({
            success: false,
            message: "The comments could not be retrieved",
          })
        );
    } else {
      res.status(404).json({
        success: false,
        message: "The post with the specified ID does not exist",
      });
    }
  });
});

router.post("", (req, res) => {
  if (req.body.title && req.body.contents) {
    Posts.insert(req.body)
      .then((postID) => {
        Posts.findById(postID.id).then((post) =>
          res.status(201).json({ success: true, post })
        );
      })
      .catch((err) => {
        res.status(500).json({
          success: false,
          error: "There was an error while saving the post to the database",
        });
      });
  } else {
    res.status(400).json({
      success: false,
      errorMessage: "Please provide title and contents for the post.",
    });
  }
});

//here I'm checking first if the comment has text - would it be better design to check if the post exists first?
router.post("/:id/comments", (req, res) => {
  const { id } = req.params;
  const body = req.body.text;

  if (req.body.text) {
    Posts.findById(id).then((post) => {
      if (post.length > 0) {
        Posts.insertComment({ text: body, post_id: Number(id) })
          .then((commentID) => {
            Posts.findCommentById(commentID.id).then((comment) =>
              res.status(201).json({ success: true, comment })
            );
          })
          .catch((err) =>
            res.status(500).json({
              success: false,
              error:
                "There was an error while saving the comment to the database",
              err,
            })
          );
      } else {
        res.status(404).json({
          success: false,
          message: "The post with the specified ID does not exist.",
        });
      }
    });
  } else {
    res.status(400).json({
      success: false,
      errorMessage: "Please provide text for the comment",
    });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  Posts.findById(id)
    .then((post) => {
      if (post.length > 0) {
        Posts.remove(id).then((removed) =>
          res.status(200).json({ success: true, removed })
        );
      } else {
        res.status(404).json({
          success: false,
          message: "The post with the specified ID does not exist.",
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        success: false,
        error: "The post could not be removed",
      })
    );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const body = req.body;
  Posts.findById(id).then((post) => {
    if (post.length > 0) {
      if (body.title && body.contents) {
        Posts.update(id, body).then((updatedPost) => {
          Posts.findById(id).then((post) =>
            res.status(200).json({ success: true, post })
          );
        });
      } else {
        res.status(400).json({
          success: false,
          errorMessage: "Please provide a title and contents for the post.",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "The post with the specified ID does not exist",
      });
    }
  });
});

module.exports = router;
