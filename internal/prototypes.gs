// string prototypes
string.clean = function(find = "")
    result_string = @self 
    while typeof(result_string.indexOf(find)) == "number"
        result_string = result_string.remove(find)
    end while 
    return result_string
end function 

string.search = function(sub_string = "")
  return typeof(self.lower.indexOf(sub_string.lower)) == "number";
end function

// array prototypes
list.format_columns = function()
    columns = {};
    longest_element_per_col = {};
    
    rm_colors = function(string)
        start_idx = string.indexOf("<") 
        end_idx = string.indexOf(">")
      
        if typeof(start_idx) == "null" or typeof(end_idx) == "null" then return string 
        to_remove = string[start_idx:end_idx + 1]
        
        string = string.clean(to_remove)
        return rm_colors(string)
    end function

    for row in self 
        column_elements = row.split(" ")
        col_element_count = 0
        for element in column_elements
            if not columns.hasIndex(col_element_count) then columns[col_element_count] = []
            if not longest_element_per_col.hasIndex(col_element_count) then longest_element_per_col[col_element_count] = 0
            columns[col_element_count].push(element)
            if longest_element_per_col[col_element_count] < element.len then longest_element_per_col[col_element_count] = rm_colors(element).len
            col_element_count = col_element_count + 1
        end for
    end for

    // assemble the final product by row and append appropriate spacing in between
    formatted = []; col_idx = -1; indent = 2
    
    for col in columns.values 
        col_idx = col_idx + 1
        row_idx = -1

        for row_elem in col 
            row_idx = row_idx + 1
            if not formatted.hasIndex(row_idx) then formatted.push("")
            formatted[row_idx] = formatted[row_idx] + row_elem + (" " * (((longest_element_per_col[col_idx] + indent) - rm_colors(row_elem).len) + indent))
        end for
    end for
     
    return formatted.join(char(10))
end function
list.fmt_cols = @list.format_columns

list.clean = function(example_list)
  result_list=[]
  if not typeof(example_list) == "list" then example_list = [example_list]
  for i in self
    if typeof(example_list.indexOf(i)) == "number" then continue
    result_list.push(i)
  end for
  self=result_list
  return self
end function