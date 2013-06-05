
$("button").on("click", function(e) {
  // disable other buttons?
  // implement some sort of spinner...

  $.ajax({
    type: "POST",
    url: "/checkout_branch",
    data: {
      pr: $(e.target).data("id")
    },
    success: branchCheckedOut,
    dataType: "json"
  });
});

function branchCheckedOut(data, status, jqxhr) {
  // change state of buttons
}
