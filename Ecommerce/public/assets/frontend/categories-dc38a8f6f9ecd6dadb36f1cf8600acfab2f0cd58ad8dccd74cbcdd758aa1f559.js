function Category(options) {
  var module = this;
  var defaults = {
    template: {
      category: $("#list-category-tempale"),
      comment: $("#list-comment-template"),
      rate: $("#list-rate-template"),
      edit_comment: $("#list-edit-comment-template"),
      list_children_comment: $("#list-comment-children-template"),
    },
    api: {
      category: "/api/v1/category",
      comment: "/api/v1/comment",
      edit_comment: "/api/v1/edit-comment",
      edit_comment_children: "/api/v1/edit-comment-children",
      delete_comment: "/api/v1/delete-comment",
      delete_comment_children: "/api/v1/delete-comment-children",
      reply_comment: "/api/v1/reply-comment",
      rate: "/api/v1/rate",
      token: Cookies.get("authozition"),
      api_token: Cookies.get("api_token"),
    },
    data: {},
  };
  module.settings = $.extend({}, defaults, options);

  module.clickshowcategory = function () {
    $(".category").on("click", function () {
      $("div.list-category").hide();
      el = $(this).closest("div .categories");
      el.find("div.list-category").show();
    });
  };

  module.clickCategory = function () {
    $(".category").on("click", function () {
      el = $(this);
      ele = $(this).closest("div .categories");
      categories_id = $(el).closest("div .panel-heading").attr("id");
      $.ajax({
        url: module.settings.api.category,
        headers: {
          Authorization: "Bearer " + module.settings.api.token,
        },
        type: "get",
        data: { categories_id: categories_id },
        dataType: "json",
        success: function (data) {
          if (data.code == 200) {
            $(".list-category").html("");
            var template_category = Handlebars.compile(
              module.settings.template.category.html()
            );
            $(ele)
              .find(".list-category")
              .append(
                template_category({
                  categories: data.data.categories,
                })
              );
          }
        },
      });
    });
  };
  module.clickEventComments = function () {
    $("#form_comment").submit(function (evt) {
      evt.preventDefault();
      ele = $(this).closest("div #reviews");

      comment = $(ele).find(".in-comment").val();
      product_id = $(ele).find(".comments").attr("id");
      check_login = $(ele).find(".login").attr("id");
      var formData = new FormData($(this)[0]);
      formData.append("token", module.settings.api.api_token);
      formData.append("product_id", product_id);
      formData.append("content", comment);

      button_load = $(ele).find(".buttonload").css("display", "block");
      btn_send_comment = $(ele).find("#btn_send_comment").hide();

      if (check_login == 1) {
        $.ajax({
          url: "/api/v1/comment",
          type: "POST",
          data: formData,
          async: false,
          cache: false,
          contentType: false,
          enctype: "multipart/form-data",
          processData: false,
          success: function (data) {
            if (data.code == 200) {
              alert("successfully");

              $("#exampleModal").modal("hide");
              $("#close").trigger("click");
              $(ele).find(".in-comment").val("");
              $(ele).find(".buttonload").css("display", "none");
              $(ele).find("#btn_send_comment").show();

              var template_comment = Handlebars.compile(
                module.settings.template.comment.html()
              );

              $(ele)
                .find(".list-comment")
                .append(
                  template_comment({
                    comment: data.data.comment,
                    name: data.data.name,
                    image: data.data.image,
                    avatar: data.data.avatar,
                  })
                );
            } else {
              Swal.fire({
                icon: "error",
                title: data.message,
              });

              $(ele).find(".buttonload").css("display", "none");
              $(ele).find("#btn_send_comment").show();
            }
          },
          error: function () {},
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Please to login before Comment!",
        }).then(() => {
          window.location = "/login";
        });
      }
    });
  };

  module.replyComment = function () {
    var template_replyComment = Handlebars.compile(
      module.settings.template.list_replyComment.html()
    );
    $(".form-comment").hide();
    $(".text-reply").one("click", function () {
      $(".text-reply-comment").show();
      $(this).parent().parent().append(template_replyComment);

      $(this)
        .parent()
        .parent()
        .find(".form-comment")
        .find(".input-comment")
        .keypress(function (event) {
          var keycode = event.keyCode ? event.keyCode : event.which;
          if (keycode == "13") {
            console.log(event.target.value);
          }
        });
    });
  };

  module.clickRateProduct = function () {
    $(".fa-star").click(function () {
      rate = $(this).attr("id").split("-")[1];
      ele = $(this).closest("div .check");
      product_id = parseInt($(ele).find(".id").attr("id"));
      check_login = $(ele).find(".login").attr("id");
      check_rate = $(ele).find("#check_rate").val();
      if (check_login == 1) {
        if (check_rate == 0) {
          $.ajax({
            url: module.settings.api.rate,
            headers: {
              Authorization: "Bearer " + module.settings.api.api_token,
            },
            type: "POST",
            data: {
              rate: rate,
              product_id: product_id,
              token: module.settings.api.api_token,
            },
            dataType: "json",
            success: function (data) {
              if (data.code == 200) {
                $(".list-rate").html("");
                var template_rate = Handlebars.compile(
                  module.settings.template.rate.html()
                );
                $(ele)
                  .find(".list-rate")
                  .append(
                    template_rate({
                      avg: data.data.avg,
                    })
                  );
                Swal.fire({
                  icon: "success",
                  title: "Rate successfully..",
                }).then(() => {
                  window.location.reload(true);
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: data.message,
                });
              }
            },
            error: function () {},
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "You have already rated this product",
          });
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "You must be logged in to rate!",
        });
      }
    });
  };

  module.hoverRateProduct = function () {
    $(".fa-star").hover(
      function () {
        $(this).prevAll().andSelf().addClass("checked");
      },
      function () {
        $(this).prevAll().andSelf().removeClass("checked");
      }
    );
  };

  module.clickeditComment = function () {
    $(document).on("click", ".edit-comment", function () {
      ele = $(this).closest(".comments");
      $(".in-comment-edit").hide();
      $(".list-edit-comment").show();
      $(ele).find(".in-comment-edit").show();
      $(ele).find(".list-edit-comment").hide();
    });
  };

  module.editComment = function () {
    $(document).on("keypress", ".in-comment-edit", function (e) {
      if (event.keyCode == 13) {
        ele = $(this).closest("div .comments");
        comment = $(ele).find(".in-comment-edit").val();
        comment_id = $(ele).find(".edit-comment").attr("id").split("-")[1];
        $.ajax({
          url: module.settings.api.edit_comment,
          headers: {
            Authorization: "Bearer " + module.settings.api.api_token,
          },
          type: "POST",
          data: {
            comment: comment,
            comment_id: comment_id,
            token: module.settings.api.api_token,
          },
          dataType: "json",
          success: function (data) {
            if (data.code == 200) {
              var template_edit_comment = Handlebars.compile(
                module.settings.template.edit_comment.html()
              );
              $(ele)
                .find(".list-edit-comment")
                .html(
                  template_edit_comment({
                    comment: data.data.comment,
                  })
                );
              $(ele).find(".list-edit-comment").show();
              $(ele).find(".in-comment-edit").hide();
              module.clickeditComment();
              module.editComment();
            } else {
              Swal.fire({
                icon: "warning",
                title: data.message,
              });
            }
          },
          error: function () {},
        });
      }
    });
  };

  module.deleteComment = function () {
    $(document).on("click", ".delete-comment", function () {
      ele = $(this).closest(".delete_comment");
      comment_id = $(ele).find(".edit-comment").attr("id").split("-")[1];
      $.ajax({
        url: module.settings.api.delete_comment,
        headers: {
          Authorization: "Bearer " + module.settings.api.api_token,
        },
        type: "delete",
        data: { comment_id: comment_id, token: module.settings.api.api_token },
        dataType: "json",
        success: function (data) {
          if (data.code == 200) {
            $(ele).html("");
            module.deleteComment();
          } else {
            Swal.fire({
              icon: "warning",
              title: "Delete comment faided!",
            }).then(() => {
              window.location = "/login";
            });
          }
        },
        error: function () {},
      });
    });
  };

  module.clickReplyComment = function () {
    $(document).on("click", ".reply_comment", function () {
      ele = $(this).closest("div #reviews");
      check_login = $(ele).find(".login").attr("id");
      if (check_login != 1) {
        Swal.fire({
          icon: "warning",
          title: "Please to login before Comment!",
        }).then(() => {
          window.location = "/login";
        });
        return;
      }
      el = $(this).parent().parent();
      id = el.attr("id");
      show_input_comment = $(this)
        .parent()
        .find(".full-tbl")
        .css("display", "block");
      $("html, body").animate(
        {
          scrollTop: $(this).parent().find(".full-tbl").offset().top,
        },
        1000
      );
    });
  };
  module.sendReplyComment = function () {
    $(document).on("click", "#send_reply_comment", function () {
      ele = $(this).closest("div #reviews");
      check_login = $(ele).find(".login").attr("id");
      if (check_login != 1) {
        Swal.fire({
          icon: "warning",
          title: "Please to login before Comment!",
        }).then(() => {
          window.location = "/login";
        });
        return;
      }
      el = $(this).closest(".delete_comment");
      id_comment = el.attr("id");

      content = $(this).parent().parent().find("#fieldReplyComment").val();
      $.ajax({
        url: module.settings.api.reply_comment,
        headers: {
          Authorization: "Bearer " + module.settings.api.token,
        },
        type: "POST",
        data: {
          id_comment: id_comment,
          content: content,
          token: module.settings.api.api_token,
        },
        dataType: "json",
        success: function (data) {
          if (data.code == 200) {
            Swal.fire({
              icon: "success",
              title: "Successfully...",
            });
            var template_comment_childen = Handlebars.compile(
              module.settings.template.list_children_comment.html()
            );

            list_children_comment = el
              .find(".comments")
              .find(".list_comment_chidren");
            list_children_comment
              .parent()
              .find(".full-tbl")
              .find("#fieldReplyComment")
              .val(null);
            comments = $("html, body").animate(
              {
                scrollTop: list_children_comment.offset().top,
              },
              1000
            );
            $(list_children_comment).append(
              template_comment_childen({
                comment_children: data.data.comment,
                avatar: data.data.avatar,
                name: data.data.name,
              })
            );
          } else {
            Swal.fire({
              icon: "error",
              title: data.message,
            });
          }
        },
      });
    });
  };

  module.clickeditCommentChildren = function () {
    $(document).on("click", ".edit", function () {
      $(this).find(".comment-children-edit").css("display", "block");
      $(this).find(".list-edit-comment-children").css("display", "none");
    });
  };

  module.editCommentChildren = function () {
    $(document).on("keypress", ".comment-children-edit", function (e) {
      if (event.keyCode == 13) {
        ele = $(this);
        comment_id = ele.attr("id");
        comment = ele.val();
        $.ajax({
          url: module.settings.api.edit_comment_children,
          headers: {
            Authorization: "Bearer " + module.settings.api.api_token,
          },
          type: "POST",
          data: {
            comment: comment,
            comment_id: comment_id,
            token: module.settings.api.api_token,
          },
          dataType: "json",
          success: function (data) {
            if (data.code == 200) {
              var template_comment_childen = Handlebars.compile(
                module.settings.template.list_children_comment.html()
              );
              comment_children_item = ele
                .parent()
                .parents(".comment_children_item");
              $(comment_children_item).html(
                template_comment_childen({
                  comment_children: data.data.comment,
                  avatar: data.data.avatar,
                  name: data.data.name,
                })
              );
            } else {
              Swal.fire({
                icon: "warning",
                title: data.message,
              });
            }
          },
          error: function () {},
        });
      }
    });
  };

  module.deleteCommentChildren = function () {
    $(document).on("click", ".delete_comment_children", function () {
      ele = $(this);
      comment_id = $(this).attr("id");
      $.ajax({
        url: module.settings.api.delete_comment_children,
        headers: {
          Authorization: "Bearer " + module.settings.api.api_token,
        },
        type: "delete",
        data: { comment_id: comment_id, token: module.settings.api.api_token },
        dataType: "json",
        success: function (data) {
          if (data.code == 200) {
            comment_children_item = $(ele).parents(".comment_children_item");

            $(comment_children_item).html("");
            // module.deleteComment();
          } else {
            Swal.fire({
              icon: "error",
              title: data.message,
            });
          }
        },
        error: function () {},
      });
    });
  };

  module.clickReplyComment = function () {
    $(document).on("click", ".reply_comment", function () {
      ele = $(this).closest("div #reviews");
      check_login = $(ele).find(".login").attr("id");
      if (check_login != 1) {
        Swal.fire({
          icon: "warning",
          title: "Please to login before Comment!",
        }).then(() => {
          window.location = "/login";
        });
        return;
      }
      el = $(this).parent().parent();
      id = el.attr("id");
      show_input_comment = $(this)
        .parent()
        .find(".full-tbl")
        .css("display", "block");
      $("html, body").animate(
        {
          scrollTop: $(this).parent().find(".full-tbl").offset().top,
        },
        1000
      );
    });
  };
  module.sendReplyComment = function () {
    $(document).on("click", "#send_reply_comment", function () {
      ele = $(this).closest("div #reviews");
      check_login = $(ele).find(".login").attr("id");
      if (check_login != 1) {
        Swal.fire({
          icon: "warning",
          title: "Please to login before Comment!",
        }).then(() => {
          window.location = "/login";
        });
        return;
      }
      el = $(this).closest(".delete_comment");
      id_comment = el.attr("id");
      btn_send = $(this);
      btn_send.css("background", "#ebebeb");
      content = $(this).parent().parent().find("#fieldReplyComment").val();
      $.ajax({
        url: module.settings.api.reply_comment,
        headers: {
          Authorization: "Bearer " + module.settings.api.token,
        },
        type: "POST",
        data: {
          id_comment: id_comment,
          content: content,
          token: module.settings.api.api_token,
        },
        dataType: "json",
        success: function (data) {
          if (data.code == 200) {
            btn_send.css("background", "#FE980F");

            Swal.fire({
              icon: "success",
              title: "successfully...",
            });
            var template_comment_childen = Handlebars.compile(
              module.settings.template.list_children_comment.html()
            );

            list_children_comment = el
              .find(".comments")
              .find(".list_comment_chidren");
            list_children_comment
              .parent()
              .find(".full-tbl")
              .find("#fieldReplyComment")
              .val(null);
            comments = $("html, body").animate(
              {
                scrollTop: list_children_comment.offset().top,
              },
              1000
            );
            $(list_children_comment).append(
              template_comment_childen({
                comment_children: data.data.comment,
                avatar: data.data.avatar,
                name: data.data.name,
              })
            );
          } else {
            Swal.fire({
              icon: "error",
              title: data.message,
            });
            btn_send.css("background", "#FE980F");
          }
        },
      });
    });
  };

  module.clickeditCommentChildren = function () {
    $(document).on("click", ".edit", function () {
      $(this).find(".comment-children-edit").css("display", "block");
      $(this).find(".list-edit-comment-children").css("display", "none");
      $(this).find(".comment-children-edit").css("height", "1px");
      $(this)
        .find(".comment-children-edit")
        .css(
          "height",
          `${$(this).find(".comment-children-edit")[0].scrollHeight}px`
        );
    });
  };

  module.editCommentChildren = function () {
    $(document).on("keypress", ".comment-children-edit", function (e) {
      if (event.keyCode == 13) {
        ele = $(this);
        comment_id = ele.attr("id");
        comment = ele.val();
        $.ajax({
          url: module.settings.api.edit_comment_children,
          headers: {
            Authorization: "Bearer " + module.settings.api.api_token,
          },
          type: "POST",
          data: {
            comment: comment,
            comment_id: comment_id,
            token: module.settings.api.api_token,
          },
          dataType: "json",
          success: function (data) {
            if (data.code == 200) {
              var template_comment_childen = Handlebars.compile(
                module.settings.template.list_children_comment.html()
              );
              comment_children_item = ele
                .parent()
                .parents(".comment_children_item");
              $(comment_children_item).html(
                template_comment_childen({
                  comment_children: data.data.comment,
                  avatar: data.data.avatar,
                  name: data.data.name,
                })
              );
            } else {
              Swal.fire({
                icon: "warning",
                title: data.message,
              });
            }
          },
          error: function () {},
        });
      }
    });
  };

  module.deleteCommentChildren = function () {
    $(document).on("click", ".delete_comment_children", function () {
      ele = $(this);
      comment_id = $(this).attr("id");
      $.ajax({
        url: module.settings.api.delete_comment_children,
        headers: {
          Authorization: "Bearer " + module.settings.api.api_token,
        },
        type: "delete",
        data: { comment_id: comment_id, token: module.settings.api.api_token },
        dataType: "json",
        success: function (data) {
          if (data.code == 200) {
            comment_children_item = $(ele).parents(".comment_children_item");

            $(comment_children_item).html("");
            // module.deleteComment();
          } else {
            Swal.fire({
              icon: "error",
              title: data.message,
            });
          }
        },
        error: function () {},
      });
    });
  };

  module.init = function () {
    module.clickshowcategory();
    module.clickCategory();
    module.clickEventComments();
    module.clickRateProduct();
    module.clickReplyComment();
    module.sendReplyComment();
    module.hoverRateProduct();
    module.editComment();
    module.clickeditComment();
    module.deleteComment();
    module.deleteCommentChildren();
    module.clickeditCommentChildren();
    module.editCommentChildren();
  };
}
$(document).ready(function () {
  category = new Category();
  category.init();
});