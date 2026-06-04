// formatting strings
string.concat = function(appended_string)
  return self + appended_string
end function

// coloring strings
string.color = function(alpha_color = "black", numeric_color = "black", symbol_color = "purple") 
  alpha_toggle = false 
  symbol_toggle = false 
  numeric_toggle = false 
  result_string = ""

  recognize_char = {
    "alpha" : "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFHJKLZXCVBNM",
    "numeric": "1234567890",
    "symbol": ",\./<>?;':[]\\{}|-=_+!@#$%^&*()`~•",
  }
  recognize_char.numeric = recognize_char.numeric.concat("""")
  
  recognize_color = {
    "black": "<color=#5B5A5C>",
    "purple": "<color=#AB5EFF>",
    "end_color": "</color>",
  }
  
  for character in self
    
    if typeof(recognize_char.alpha.indexOf(character)) == "number" and not alpha_toggle then 
      
      //cleanup
      if numeric_toggle then 
        result_string = result_string.concat(recognize_color.end_color)
        numeric_toggle = false 
      end if

      if symbol_toggle then 
        result_string = result_string.concat(recognize_color.end_color)
        symbol_toggle = false 
      end if

      //add new color
      alpha_toggle = true 
      result_string = result_string.concat(recognize_color[alpha_color] + character)
      continue

    end if

    if typeof(recognize_char.numeric.indexOf(character)) == "number" and not numeric_toggle then 

      //cleanup 
      if alpha_toggle then 
        result_string = result_string.concat(recognize_color.end_color)
        alpha_toggle = false 
      end if 

      if symbol_toggle then 
        result_string = result_string.concat(recognize_color.end_color)
        symbol_toggle = false 
      end if

      //add new color 
      numeric_toggle = true 
      result_string = result_string.concat(recognize_color[numeric_color] + character)
      continue 

    end if

    if typeof(recognize_char.symbol.indexOf(character)) == number and not symbol_toggle then 

      //cleanup
      if alpha_toggle then 
        result_string = result_string.concat(recognize_color.end_color)
        alpha_toggle = false 
      end if 

      if numeric_toggle then 
        result_string = result_string.concat(recognize_color.end_color)
        numeric_toggle = false 
      end if

      //add new color 
      symbol_toggle = true 
      result_string = result_string.concat(recognize_color[symbol_color] + character)
      continue 

    end if

    result_string = result_string.concat(character)

  end for

  return result_string.concat(recognize_color.end_color)
  
end function
string.c = @string.color

string.c_reg_txt = function()
  return self.color()
end function

string.c_emph_int = function()
  return self.color("black", "purple", "purple")
end function 

string.c_all_black = function()
  return self.color("black", "black", "black")
end function 

string.c_all_purple = function()
  return self.color("purple", "purple", "purple")
end function

string.center = function()

end function 
string.ctr = @string.center

//string markup

string.bold = function()
  return "<b>" + self + "</b>"
end function 
string.b = @string.bold


// design elements

wisp="•".c_all_purple + " ".c_all_black +"•".c_all_purple
reveal=function(str, onCondition=0, elseShow="");if onCondition then return str;return elseShow;end function
box=function(str)
  return ("(".c_all_black + "<u>" + str.c_all_purple + ")".c_all_black).bold
end function