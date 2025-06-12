import { Input } from "antd";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";

const Search = ({
  placeholder = "Tìm kiếm...",
  fetchData,
  onSearchResults,
  currentPage = 1,
  pageSize = 10,
  additionalParams = {},
  debounceTime = 500,
}) => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant?.id;
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Sử dụng useCallback để đảm bảo hàm debounce không bị tạo lại mỗi khi render
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchKeyword(value);
    }, debounceTime),
    [debounceTime]
  );

  useEffect(() => {
    // Nếu không có hàm fetchData, không thực hiện tìm kiếm
    if (!fetchData || !restaurantId) return;

    const performSearch = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: pageSize,
          ...additionalParams,
        };

        // Thêm từ khóa tìm kiếm nếu có
        if (searchKeyword.trim()) {
          params.search = searchKeyword.trim();
        }

        // Gọi API tìm kiếm được truyền vào
        const res = await fetchData(restaurantId, params);

        // Trả kết quả về component cha
        if (onSearchResults) {
          onSearchResults(res.results || [], res.totalResults || 0);
        }
      } catch (error) {
        console.error("Search error:", error);
        // Gọi callback với mảng rỗng nếu có lỗi
        if (onSearchResults) {
          onSearchResults([], 0);
        }
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchKeyword, restaurantId, currentPage, pageSize, additionalParams, fetchData]);

  // Cleanup debounce khi component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Nếu xóa hết text, reset tìm kiếm ngay lập tức
    if (newValue === "") {
      debouncedSearch.cancel();
      setSearchKeyword("");
    } else {
      debouncedSearch(newValue);
    }
  };

  const handleSearch = (value) => {
    debouncedSearch.cancel();
    setSearchKeyword(value);
  };

  return (
    <div className="search-container">
      <Input.Search
        placeholder={placeholder}
        style={{ width: 300, marginLeft: 16 }}
        value={inputValue}
        onChange={handleInputChange}
        onSearch={handleSearch}
        loading={loading}
        allowClear
        enterButton
      />
    </div>
  );
};

export default Search;
